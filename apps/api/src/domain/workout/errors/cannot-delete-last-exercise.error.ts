/** RF-008: WorkoutDay must have at least one Exercise; cannot delete the last exercise */
export class CannotDeleteLastExerciseError extends Error {
  constructor(dayId: string) {
    super(
      `Cannot delete the last exercise of a workout day. Day must have at least one exercise. Day: ${dayId}`,
    );
    this.name = "CannotDeleteLastExerciseError";
  }
}
