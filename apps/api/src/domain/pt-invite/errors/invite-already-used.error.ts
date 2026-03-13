export class InviteAlreadyUsedError extends Error {
  constructor(token: string) {
    super(`Invite already used or revoked: ${token}`);
    this.name = "InviteAlreadyUsedError";
  }
}
