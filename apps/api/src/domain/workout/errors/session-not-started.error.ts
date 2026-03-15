export class SessionNotStartedError extends Error {
  constructor(sessionId: string) {
    super(`Workout session cannot be completed: session was not started (${sessionId})`);
    this.name = "SessionNotStartedError";
  }
}
