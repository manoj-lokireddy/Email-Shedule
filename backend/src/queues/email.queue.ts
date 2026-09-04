import { Queue } from 'bullmq';
import { redis } from '../config';
export const emailQueue = new Queue('emailQueue', { connection: redis, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 1000, removeOnFail: 5000 } });
