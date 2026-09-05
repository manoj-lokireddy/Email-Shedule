import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { prisma } from '../config/db';
import { config } from '../config';
import { requireAuth } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
const signUser = (userId: string) => jwt.sign({ userId }, config.jwtSecret, { expiresIn: '7d' });
const hashPassword = (password: string) => { const salt = randomBytes(16).toString('hex'); return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`; };
const matchesPassword = (password: string, stored: string) => { const [salt, hash] = stored.split(':'); if (!salt || !hash) return false; const derived = scryptSync(password, salt, 64); return timingSafeEqual(derived, Buffer.from(hash, 'hex')); };
const router = Router(); router.use(cookieParser());
router.post('/register', async (req, res, next) => {
	try {
		const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
		if (!name?.trim() || !email?.trim() || !password || password.length < 6) return res.status(400).json({ error: 'Name, email, and a password of at least 6 characters are required' });
		const username = email.trim().toLowerCase();
		const existing = await prisma.user.findFirst({ where: { OR: [{ email: username }, { username }] } });
		if (existing?.passwordHash) return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
		const user = existing
			? await prisma.user.update({ where: { id: existing.id }, data: { username, passwordHash: hashPassword(password), name: name.trim(), email: username } })
			: await prisma.user.create({ data: { username, passwordHash: hashPassword(password), name: name.trim(), email: username } });
		res.cookie('reachinbox_token', signUser(user.id), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 604800000 });
		res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
	} catch (error) { next(error); }
});
router.post('/login', async (req, res, next) => {
	try {
		const { username, password } = req.body as { username?: string; password?: string };
		const account = username?.trim().toLowerCase();
		const user = account ? await prisma.user.findFirst({ where: { OR: [{ username: account }, { email: account }, { name: username?.trim() }] } }) : null;
		if (!user || !password || !matchesPassword(password, user.passwordHash)) return res.status(401).json({ error: 'Invalid name/email or password' });
		res.cookie('reachinbox_token', signUser(user.id), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 604800000 });
		res.json({ user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
	} catch (error) { next(error); }
});
router.get('/me', requireAuth, async (req, res) => res.json({ user: await prisma.user.findUnique({ where: { id: req.userId }, select: { id: true, name: true, email: true, avatar: true } }) }));
router.post('/logout', (_req, res) => { res.clearCookie('reachinbox_token'); res.json({ ok: true }); });
export default router;
