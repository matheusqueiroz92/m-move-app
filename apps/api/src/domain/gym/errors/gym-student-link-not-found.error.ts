export class GymStudentLinkNotFoundError extends Error {
  constructor(linkId: string) {
    super(`Gym student link not found: ${linkId}`);
    this.name = "GymStudentLinkNotFoundError";
  }
}
