export class PtInviteNotFoundError extends Error {
  constructor(inviteId: string) {
    super(`PT invite not found: ${inviteId}`);
    this.name = "PtInviteNotFoundError";
  }
}
