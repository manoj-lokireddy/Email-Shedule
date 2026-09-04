import { Client } from '@elastic/elasticsearch';
import { config } from '../config';
export const searchClient = new Client({ node: config.elasticsearchUrl });
export async function indexEmail(job: any) { try { await searchClient.index({ index: 'emails', id: job.id, document: { emailJobId: job.id, campaignId: job.campaignId, userId: job.campaign.userId, senderEmail: job.sender.email, recipientEmail: job.recipientEmail, subject: job.subject, body: job.body, status: job.status, scheduledAt: job.scheduledAt, sentAt: job.sentAt, createdAt: job.createdAt } }); } catch (error) { console.error('Elasticsearch indexing failed', error); } }
