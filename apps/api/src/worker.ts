import { PrismaClient } from '@prisma/client';
import { checkKeys, unseal } from './access/credentials';
import { mailTransport, renderMail, MailPayload } from './mail/mail';

checkKeys();
const db = new PrismaClient();
const transport = mailTransport();
const intervalMs = Number(process.env.WORKER_POLL_MS ?? 2000);
let running = true;

async function drainOnce() {
  const pending = await db.outbox.findMany({ where: { kind: 'mail', sentAt: null }, orderBy: { createdAt: 'asc' }, take: 20, include: { user: { select: { email: true } } } });
  for (const row of pending) {
    const claimed = await db.outbox.updateMany({ where: { id: row.id, sentAt: null }, data: { sentAt: new Date() } });
    if (!claimed.count) continue;
    try {
      const payload = JSON.parse(unseal(row.payload)) as MailPayload;
      await transport.sendMail(renderMail(row.user.email, payload));
      console.log(JSON.stringify({ event: 'mail_sent', outboxId: row.id, purpose: payload.purpose }));
    } catch (error) {
      await db.outbox.update({ where: { id: row.id }, data: { sentAt: null } });
      console.error(JSON.stringify({ event: 'mail_failed', outboxId: row.id, error: error instanceof Error ? error.name : 'unknown' }));
    }
  }
}

async function loop() {
  while (running) {
    try { await drainOnce(); } catch (error) { console.error(JSON.stringify({ event: 'worker_error', error: error instanceof Error ? error.name : 'unknown' })); }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
}

async function stop() { running = false; await db.$disconnect(); process.exit(0); }
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
console.log(JSON.stringify({ event: 'worker_ready', intervalMs }));
void loop();
