import type { ChatMessage } from './chat.js';

export interface SessionState {
  sessionId: string;
  createdAt: string;
  lastActivityAt: string;
  conversationHistory: ChatMessage[];
}
