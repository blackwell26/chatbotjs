export interface VectorDbClientConfig {
  baseUrl: string;
}

export function createVectorDbClientConfig(baseUrl: string): VectorDbClientConfig {
  return { baseUrl };
}
