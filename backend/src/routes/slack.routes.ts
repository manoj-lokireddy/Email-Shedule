import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { config } from '../config';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/connect', requireAuth, (_req, res, next) => { if (!config.slack.id || !config.slack.secret) return res.status(503).json({ error: 'Slack OAuth is not configured. Add SLACK_CLIENT_ID and SLACK_CLIENT_SECRET to backend/.env.' }); next(); }, passport.authenticate('Slack', { session: false }));
router.get('/callback', passport.authenticate('slack', { session: false, failureRedirect: `${config.frontendUrl}?slack=error` }), async (req, res) => {
  const profile: any = req.user;
  let userId: string;
  try { userId = (jwt.verify(req.cookies?.reachinbox_token, config.jwtSecret) as { userId: string }).userId; }
  catch { return res.status(401).send('Sign in before connecting Slack'); }
  await prisma.slackConnection.upsert({ where: { userId }, update: { accessToken: profile.accessToken, teamId: profile.team?.id ?? profile.team_id ?? 'general', teamName: profile.team?.name ?? 'Slack', connected: true }, create: { userId, accessToken: profile.accessToken, teamId: profile.team?.id ?? 'general', teamName: profile.team?.name ?? 'Slack' } });
  res.redirect(config.frontendUrl);
});
router.get('/status', requireAuth, async (req, res) => res.json({ slack: await prisma.slackConnection.findUnique({ where: { userId: req.userId }, select: { teamId: true, teamName: true, connected: true } }) }));
router.post('/disconnect', requireAuth, async (req, res) => { await prisma.slackConnection.updateMany({ where: { userId: req.userId }, data: { connected: false } }); res.json({ ok: true }); });
export default router;
