export class InstructorLimitReachedError extends Error {
  constructor(gymId: string, maxInstructors: number) {
    super(
      `Instructor limit reached for gym ${gymId}. Maximum: ${maxInstructors}`,
    );
    this.name = "InstructorLimitReachedError";
  }
}
