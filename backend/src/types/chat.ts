export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  sessionId?: string;
  message: string;
  conversationHistory?: ChatMessage[];
  stream?: boolean;
}

export interface ChatResponse {
  sessionId: string;
  reply: string;
  historyUnavailable?: boolean;
  retrievalSkipped?: boolean;
  noContextFound?: boolean;
}
