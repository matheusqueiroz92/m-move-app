export class DayNotFoundError extends Error {
  constructor(dayId: string) {
    super(`Workout day not found: ${dayId}`);
    this.name = "DayNotFoundError";
  }
}
