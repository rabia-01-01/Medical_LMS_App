import { createServer } from 'vite';

async function start() {
  const server = await createServer({
    configFile: './vite.config.js',
    server: {
      port: 3000,
      host: '0.0.0.0'
    }
  });
  await server.listen();
  server.printUrls();

  // Keep event loop active indefinitely
  setInterval(() => {}, 60000);
}

start().catch((err) => {
  console.error('Failed to start Vite server:', err);
  process.exit(1);
});

