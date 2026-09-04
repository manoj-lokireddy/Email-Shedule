import 'dotenv/config';
import { Redis } from 'ioredis';

export const config = {
  port: Number(process.env.PORT ?? 4000), frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET ?? 'development-only-secret',
  redis: { url: process.env.REDIS_URL, host: process.env.REDIS_HOST ?? 'localhost', port: Number(process.env.REDIS_PORT ?? 6379), password: process.env.REDIS_PASSWORD || undefined },
  elasticsearchUrl: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200',
  workerConcurrency: Number(process.env.WORKER_CONCURRENCY ?? 5),
  maxPerHour: Number(process.env.MAX_EMAILS_PER_HOUR_PER_SENDER ?? 100),
  google: { id: process.env.GOOGLE_CLIENT_ID ?? '', secret: process.env.GOOGLE_CLIENT_SECRET ?? '', callback: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:4000/api/auth/google/callback' },
  slack: { id: process.env.SLACK_CLIENT_ID ?? '', secret: process.env.SLACK_CLIENT_SECRET ?? '', redirect: process.env.SLACK_REDIRECT_URI ?? 'http://localhost:4000/api/slack/callback' },
  smtp: { host: process.env.SMTP_HOST ?? 'smtp.ethereal.email', port: Number(process.env.SMTP_PORT ?? 587), user: process.env.SMTP_USER ?? '', password: process.env.SMTP_PASSWORD ?? '' }
};
export const redis = config.redis.url
  ? new Redis(config.redis.url, { maxRetriesPerRequest: null })
  : new Redis({ host: config.redis.host, port: config.redis.port, password: config.redis.password, maxRetriesPerRequest: null });
