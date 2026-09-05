import passport from 'passport';
import { Strategy as SlackStrategy } from 'passport-slack-oauth2';
import { config } from '../config';

export function configureOAuth() {
  if (config.slack.id && config.slack.secret) passport.use(new SlackStrategy({ clientID: config.slack.id, clientSecret: config.slack.secret, callbackURL: config.slack.redirect, scope: ['identity.basic', 'chat:write'] }, async (_a: string, _r: string, profile: any, done: any) => done(null, profile)) as any);
}
