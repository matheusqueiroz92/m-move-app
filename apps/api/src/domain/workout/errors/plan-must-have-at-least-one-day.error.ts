/** RF-006: Plan must have at least one WorkoutDay to be activated */
export class PlanMustHaveAtLeastOneDayError extends Error {
  constructor(planId: string) {
    super(
      `Workout plan must have at least one day to be activated. Plan: ${planId}`,
    );
    this.name = "PlanMustHaveAtLeastOneDayError";
  }
}
