import app from './app'; import { config } from './config'; import { prisma } from './config/db';
app.listen(config.port, () => console.log(`API listening on http://localhost:${config.port}`)); process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
