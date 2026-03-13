export class InviteExpiredError extends Error {
  constructor(token: string) {
    super(`Invite token expired: ${token}`);
    this.name = "InviteExpiredError";
  }
}
