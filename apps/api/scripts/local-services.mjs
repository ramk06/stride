import EmbeddedPostgres from 'embedded-postgres';
import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';

const database = new EmbeddedPostgres({ databaseDir: '.postgres', user: 'stride', password: 'stride_local_only', port: 5432, persistent: true, authMethod: 'scram-sha-256', initdbFlags: ['--encoding=UTF8', '--locale=C'], postgresFlags: ['-h', '127.0.0.1'] });
if (!existsSync('.postgres/PG_VERSION')) await database.initialise();
await database.start();
const client = database.getPgClient();
await client.connect();
for (const name of ['stride', 'stride_test']) {
  const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
  if (!result.rowCount) await client.query(`CREATE DATABASE "${name}" TEMPLATE template0 ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C'`);
}
await client.end();
const messages = [];
const smtp = new SMTPServer({ authOptional: true, disabledCommands: ['STARTTLS', 'AUTH'], onData(stream, session, callback) {
  simpleParser(stream).then(message => { messages.unshift({ to: message.to?.text, subject: message.subject, text: message.text }); messages.splice(100); callback(); }).catch(callback);
} });
smtp.listen(1025, '127.0.0.1');
const inbox = createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(messages, null, 2));
}).listen(8025, '127.0.0.1');
console.log('Local PostgreSQL: 5432; SMTP: 1025; mail inbox: http://localhost:8025 (development only).');
async function stop() { smtp.close(); inbox.close(); await database.stop(); process.exit(); }
process.on('SIGINT', stop);
process.on('SIGTERM', stop);