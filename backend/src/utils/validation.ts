import { z } from 'zod';
export const campaignSchema = z.object({ senderId: z.string().min(1), subject: z.string().min(1).max(300), body: z.string().min(1), startTime: z.coerce.date(), delayBetweenEmails: z.coerce.number().int().min(0).max(86400), hourlyLimit: z.coerce.number().int().positive().max(100000), recipients: z.array(z.string().email()).min(1).max(100000) });
