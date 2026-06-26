import type { SessionState } from '../types/session.js';

export interface SessionStore {
  get(sessionId: string): SessionState | undefined;
  upsert(session: SessionState): void;
  delete(sessionId: string): void;
  list(): SessionState[];
}

export class InMemorySessionStore implements SessionStore {
  private readonly sessions = new Map<string, SessionState>();

  get(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  upsert(session: SessionState): void {
    this.sessions.set(session.sessionId, session);
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  list(): SessionState[] {
    return [...this.sessions.values()];
  }
}
