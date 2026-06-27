export interface AppConfig {
  nodeEnv: string;
  port: number;
  ollamaHost: string;
  ollamaPort: number;
  ollamaModel: string;
  vectorDbUrl: string;
  sessionTimeoutMinutes: number;
  corsOrigin: string;
  maxTurns: number;
  requestBodyLimitKb: number;
}

function readString(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadConfig(): AppConfig {
  return {
    nodeEnv: readString('NODE_ENV', 'development'),
    port: readNumber('PORT', 8000),
    ollamaHost: readString('OLLAMA_HOST', '192.168.1.85'),
    ollamaPort: readNumber('OLLAMA_PORT', 11434),
    ollamaModel: readString('OLLAMA_MODEL', 'llama3.2'),
    vectorDbUrl: readString('VECTOR_DB_URL', 'http://vector-db:6333'),
    sessionTimeoutMinutes: readNumber('SESSION_TIMEOUT_MINUTES', 30),
    corsOrigin: readString('CORS_ORIGIN', 'http://localhost:4200'),
    maxTurns: readNumber('MAX_TURNS', 20),
    requestBodyLimitKb: readNumber('REQUEST_BODY_LIMIT_KB', 32),
  };
}
