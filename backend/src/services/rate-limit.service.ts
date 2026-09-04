import { redis } from '../config';
import { notifyRateLimit } from './slack.service';
export async function reserveRateSlot(senderId: string, userId: string, senderEmail: string, limit: number) { const hour = Math.floor(Date.now() / 3600000); const key = `email-rate-limit:${senderId}:${hour}`; const count = await redis.incr(key); if (count === 1) await redis.expire(key, 7200); if (count <= limit) return { allowed: true }; await redis.decr(key); await notifyRateLimit(userId, senderEmail, limit, String(hour)); return { allowed: false, nextAt: (hour + 1) * 3600000 }; }
