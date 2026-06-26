export interface OllamaClientConfig {
  host: string;
  port: number;
  model: string;
  timeoutMs: number;
}

export function createOllamaClientConfig(
  host: string,
  port: number,
  model: string,
  timeoutMs: number,
): OllamaClientConfig {
  return { host, port, model, timeoutMs };
}
