import { mkdir, writeFile } from 'node:fs/promises';
import openapiTS, { astToString } from 'openapi-typescript';
import { createApp } from './app';

async function generate() {
  const { app, document } = await createApp();
  try {
    await mkdir('../../packages/contracts', { recursive: true });
    await writeFile('../../packages/contracts/openapi.json', JSON.stringify(document, null, 2));
    const types = await openapiTS(JSON.stringify(document));
    await writeFile('../../packages/contracts/api.d.ts', astToString(types));
  } finally { await app.close(); }
}
void generate();