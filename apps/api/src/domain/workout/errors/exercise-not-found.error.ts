export class ExerciseNotFoundError extends Error {
  constructor(exerciseId: string) {
    super(`Workout exercise not found: ${exerciseId}`);
    this.name = "ExerciseNotFoundError";
  }
}
