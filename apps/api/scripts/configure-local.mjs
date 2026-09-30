import { writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

const lines = [
  'DATABASE_URL=postgresql://stride:stride_local_only@localhost:5432/stride?connection_limit=5',
  `JWT_SECRET=${randomBytes(48).toString('hex')}`,
  `MAIL_ENCRYPTION_KEY=${randomBytes(32).toString('hex')}`,
  'PORT=3001', 'WEB_ORIGIN=http://localhost:8082', 'SMTP_HOST=127.0.0.1', 'SMTP_PORT=1025',
  'SMTP_SECURE=false', 'MAIL_FROM=hello@stride.local', 'NODE_ENV=development',
];
try {
  await writeFile('.env', lines.join('\n') + '\n', { flag: 'wx', mode: 0o600 });
  console.log('Generated local server configuration (.env). Secret values were not printed.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('Existing .env preserved; no secrets overwritten.');
}
