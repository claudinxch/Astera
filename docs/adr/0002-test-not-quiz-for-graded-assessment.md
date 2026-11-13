# "test" not "quiz" for the graded short-assessment assignment type

The assignment type for a short graded in-class assessment is named `test`, not `quiz`. The word "quiz" is reserved for Practice Quiz — the AI-generated self-study tool (M7). Using the same word for both a graded academic submission and an AI learning tool would create a persistent naming collision in the UI, the domain model, and the codebase. A future reader seeing no `quiz` assignment type should read this ADR rather than adding one back.
