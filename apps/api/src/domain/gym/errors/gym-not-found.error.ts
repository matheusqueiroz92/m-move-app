export class GymNotFoundError extends Error {
  constructor(gymId: string) {
    super(`Gym not found: ${gymId}`);
    this.name = "GymNotFoundError";
  }
}
