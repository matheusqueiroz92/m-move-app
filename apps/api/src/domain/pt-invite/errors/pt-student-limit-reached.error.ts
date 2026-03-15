/** RN-012: Personal trainer has reached the maximum number of linked students for their plan */
export class PtStudentLimitReachedError extends Error {
  constructor(maxStudents: number) {
    super(
      `Linked student limit reached for your plan. Maximum: ${maxStudents}.`,
    );
    this.name = "PtStudentLimitReachedError";
  }
}
