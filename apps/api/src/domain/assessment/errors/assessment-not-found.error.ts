export class AssessmentNotFoundError extends Error {
  constructor(assessmentId: string) {
    super(`Assessment not found: ${assessmentId}`);
    this.name = "AssessmentNotFoundError";
  }
}
