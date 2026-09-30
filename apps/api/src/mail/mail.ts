import * as nodemailer from 'nodemailer';
import { required } from '../access/credentials';

export type MailPayload = { purpose: string; token: string; expiresAt: string };

const subjects: Record<string, string> = { verify: 'Verify your Stride account', reset: 'Reset your Stride password' };

export function mailTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? '127.0.0.1',
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: required('SMTP_PASSWORD') } : undefined,
  });
}

export function renderMail(email: string, payload: MailPayload) {
  const action = payload.purpose === 'reset' ? 'reset your password' : 'verify your email';
  return {
    from: process.env.MAIL_FROM ?? 'hello@stride.local',
    to: email,
    subject: subjects[payload.purpose] ?? 'Stride notification',
    text: `Use this single-use token to ${action} in the Stride app:\n\n${payload.token}\n\nIt expires at ${payload.expiresAt}. If you did not request this, ignore this message.`,
  };
}
