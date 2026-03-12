export class PlanNotFoundError extends Error {
  constructor(planId: string) {
    super(`Workout plan not found: ${planId}`);
    this.name = "PlanNotFoundError";
  }
}
