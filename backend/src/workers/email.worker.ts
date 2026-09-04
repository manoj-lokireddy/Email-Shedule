import { Worker } from 'bullmq';
import { redis, config } from '../config';
import { prisma } from '../config/db';
import { sendSmtp } from '../services/smtp.service';
import { reserveRateSlot } from '../services/rate-limit.service';
import { indexEmail } from '../services/email-search.service';
import { DelayedError } from 'bullmq';

let worker: Worker;
worker = new Worker('emailQueue', async job => {
  const record = await prisma.emailJob.findUnique({ where: { id: job.data.emailJobId }, include: { campaign: true, sender: true } });
  if (!record || record.status === 'sent') return;
  const claimed = await prisma.emailJob.updateMany({ where: { id: record.id, status: { in: ['scheduled', 'delayed'] } }, data: { status: 'processing', attempts: { increment: 1 } } });
  if (claimed.count === 0) return;
  const current = await prisma.emailJob.findUniqueOrThrow({ where: { id: record.id }, include: { campaign: true, sender: true } });
  const slot = await reserveRateSlot(current.senderId, current.campaign.userId, current.sender.email, current.campaign.hourlyLimit || config.maxPerHour);
  if (!slot.allowed) {
    await prisma.emailJob.update({ where: { id: current.id }, data: { status: 'delayed', scheduledAt: new Date(slot.nextAt!) } });
    await job.moveToDelayed(slot.nextAt!, job.token);
    throw new DelayedError();
  }
  try {
    const sent = await sendSmtp(current.sender, current.recipientEmail, current.subject, current.body);
    const updated = await prisma.emailJob.update({ where: { id: current.id }, data: { status: 'sent', sentAt: new Date(), messageId: sent.messageId }, include: { campaign: true, sender: true } });
    await indexEmail(updated);
  } catch (error) {
    await prisma.emailJob.update({ where: { id: current.id }, data: { status: 'failed', errorMessage: error instanceof Error ? error.message : 'SMTP failure' } });
    throw error;
  }
}, { connection: redis, concurrency: config.workerConcurrency });
worker.on('completed', job => console.log(`Completed ${job.id}`));
worker.on('failed', (job, error) => console.error(`Failed ${job?.id}`, error.message));
worker.on('ready', () => console.log('Email worker ready'));
worker.on('error', error => console.error('Email worker error', error));
