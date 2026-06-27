import { loadConfig } from './config/env.js';
import { createHttpServer } from './server/http-server.js';

const config = loadConfig();
const bootstrap = createHttpServer(config);

const shutdown = async (signal: string): Promise<void> => {
  console.log(
    JSON.stringify({
      level: 'info',
      message: 'shutting down api gateway',
      service: 'api-gateway',
      signal,
    }),
  );

  await bootstrap.close();
  process.exit(0);
};

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

bootstrap
  .listen(config.port)
  .then((port) => {
    console.log(
      JSON.stringify({
        level: 'info',
        message: 'api gateway listening',
        service: 'api-gateway',
        environment: config.nodeEnv,
        port,
      }),
    );
  })
  .catch((error: unknown) => {
    console.error(
      JSON.stringify({
        level: 'error',
        message: 'failed to start api gateway',
        service: 'api-gateway',
        error: error instanceof Error ? error.message : 'unknown error',
      }),
    );
    process.exit(1);
  });
