import app from './app'; import { config } from './config'; import { prisma } from './config/db';
app.listen(config.port, '0.0.0.0', () => console.log(`API listening on port ${config.port}`)); process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
