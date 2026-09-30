import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

export const opaque = () => randomBytes(32).toString('hex');
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Configure ${name} on the server.`);
  return value;
}
export function checkKeys() {
  if (required('JWT_SECRET').length < 32 || !/^[a-f0-9]{64}$/i.test(required('MAIL_ENCRYPTION_KEY'))) throw new Error('Configure strong server keys.');
}
export function seal(value: string) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(required('MAIL_ENCRYPTION_KEY'), 'hex'), nonce);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return Buffer.concat([nonce, cipher.getAuthTag(), ciphertext]).toString('base64');
}
export function unseal(value: string) {
  const bytes = Buffer.from(value, 'base64');
  const cipher = createDecipheriv('aes-256-gcm', Buffer.from(required('MAIL_ENCRYPTION_KEY'), 'hex'), bytes.subarray(0, 12));
  cipher.setAuthTag(bytes.subarray(12, 28));
  return Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]).toString('utf8');
}
