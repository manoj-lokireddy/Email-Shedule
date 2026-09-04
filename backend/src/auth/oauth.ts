import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { Strategy as SlackStrategy } from 'passport-slack-oauth2';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { config } from '../config';

export function configureOAuth() {
  if (config.google.id && config.google.secret) passport.use(new GoogleStrategy({ clientID: config.google.id, clientSecret: config.google.secret, callbackURL: config.google.callback }, async (_a, _r, profile: Profile, done) => {
    try { const user = await prisma.user.upsert({ where: { googleId: profile.id }, update: { name: profile.displayName, avatar: profile.photos?.[0]?.value }, create: { googleId: profile.id, name: profile.displayName || 'Google user', email: profile.emails?.[0]?.value ?? `${profile.id}@google.local`, avatar: profile.photos?.[0]?.value } }); done(null, user); } catch (error) { done(error as Error); }
  }));
  if (config.slack.id && config.slack.secret) passport.use(new SlackStrategy({ clientID: config.slack.id, clientSecret: config.slack.secret, callbackURL: config.slack.redirect, scope: ['identity.basic', 'chat:write'] }, async (_a: string, _r: string, profile: any, done: any) => done(null, profile)) as any);
}
export function signUser(userId: string) { return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '7d' }); }
