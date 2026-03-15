export class GymAccessDeniedError extends Error {
  constructor(gymId: string) {
    super(`Access denied to gym: ${gymId}. Must be OWNER or INSTRUCTOR.`);
    this.name = "GymAccessDeniedError";
  }
}
