export class InstructorLinkNotFoundError extends Error {
  constructor(linkId: string) {
    super(`Gym instructor link not found: ${linkId}`);
    this.name = "InstructorLinkNotFoundError";
  }
}
