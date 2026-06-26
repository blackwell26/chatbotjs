export interface RetrievedChunk {
  id: string;
  sourceDocumentName: string;
  sourcePath: string;
  chunkIndex: number;
  rawText: string;
  similarity: number;
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  skipped?: boolean;
  reason?: string;
}
