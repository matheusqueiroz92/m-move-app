/** RN-012: Gym has reached its maximum number of linked students */
export class StudentLimitReachedError extends Error {
  constructor(gymId: string, maxStudents: number) {
    super(
      `Student limit reached for gym. Maximum: ${maxStudents}. Gym: ${gymId}`,
    );
    this.name = "StudentLimitReachedError";
  }
}
