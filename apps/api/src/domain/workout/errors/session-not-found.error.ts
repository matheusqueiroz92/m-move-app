export class SessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Workout session not found: ${sessionId}`);
    this.name = "SessionNotFoundError";
  }
}
