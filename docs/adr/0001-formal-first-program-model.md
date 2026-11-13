# Formal-first program model

The app is built primarily for university students managing formal academic programs with Terms, graded Courses, Assignments and Exams. Informal use cases (e.g. self-paced Udemy courses with no terms or formal grades) are explicitly out of scope for now. Term is nullable in the database to leave the door open, but the current UI treats it as expected. This keeps the data model and UI simple and grounded in the validated use case; informal support can be added later by relaxing constraints rather than redesigning.

## Considered options

- **Type field on Program** (`formal` / `informal`): would have let the UI hide Term and grade machinery for informal programs. Rejected because it adds complexity before informal use is validated.
- **Term always optional**: simpler schema, but the UI would need to handle the no-term case everywhere from the start.
