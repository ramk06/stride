import { createApp } from './app';

void createApp().then(async ({ app }) => {
  await app.listen(Number(process.env.PORT ?? 3001), '0.0.0.0');
  console.log(JSON.stringify({ event: 'api_ready', port: Number(process.env.PORT ?? 3001), accountAccess: 'enabled' }));
}).catch(() => { console.error('API startup failed. Check server configuration and database.'); process.exitCode = 1; });