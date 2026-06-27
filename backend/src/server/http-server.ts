import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import type { AppConfig } from '../config/env.js';

export interface ServerBootstrap {
  server: ReturnType<typeof createServer>;
  listen: (port: number) => Promise<number>;
  close: () => Promise<void>;
}

function writeJson(
  response: ServerResponse,
  statusCode: number,
  payload: Record<string, unknown>,
): void {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function createRequestHandler(config: AppConfig) {
  return (_request: IncomingMessage, response: ServerResponse): void => {
    writeJson(response, 200, {
      status: 'ok',
      service: 'api-gateway',
      environment: config.nodeEnv,
    });
  };
}

export function createHttpServer(config: AppConfig): ServerBootstrap {
  const server = createServer(createRequestHandler(config));

  return {
    server,
    listen(port: number): Promise<number> {
      return new Promise((resolve, reject) => {
        const onError = (error: Error): void => {
          server.off('listening', onListening);
          reject(error);
        };

        const onListening = (): void => {
          server.off('error', onError);
          const address = server.address();
          if (address && typeof address === 'object') {
            resolve(address.port);
            return;
          }

          resolve(port);
        };

        server.once('error', onError);
        server.once('listening', onListening);
        server.listen(port);
      });
    },
    close(): Promise<void> {
      return new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    },
  };
}
