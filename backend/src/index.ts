import { loadConfig } from './config/env.js';

const config = loadConfig();

// Placeholder bootstrap for the Node.js API gateway.
console.log(
  JSON.stringify({
    level: 'info',
    message: 'backend scaffold initialized',
    service: 'api-gateway',
    environment: config.nodeEnv,
  }),
);
