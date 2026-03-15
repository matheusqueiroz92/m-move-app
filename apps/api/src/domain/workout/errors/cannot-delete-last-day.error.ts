/** RF-006: Plan must always have at least one WorkoutDay; cannot delete the last day */
export class CannotDeleteLastDayError extends Error {
  constructor(planId: string) {
    super(
      `Cannot delete the last day of a workout plan. Plan must have at least one day. Plan: ${planId}`,
    );
    this.name = "CannotDeleteLastDayError";
  }
}
