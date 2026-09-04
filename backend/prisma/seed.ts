import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() { const user = await prisma.user.upsert({ where: { googleId: 'demo-google-user' }, update: {}, create: { googleId: 'demo-google-user', name: 'Demo User', email: 'demo@example.com' } }); await prisma.sender.upsert({ where: { id: 'demo-sender' }, update: {}, create: { id: 'demo-sender', userId: user.id, email: 'test@example.com', name: 'Test Sender', etherealUsername: process.env.SMTP_USER ?? 'configure-me', etherealPassword: process.env.SMTP_PASSWORD ?? 'configure-me' } }); }
main().finally(() => prisma.$disconnect());
