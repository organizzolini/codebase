// 🏷️ Types

/**
 * What committing the leftover versions came to: carry on tagging, or stop
 * because `main` moved and the run stepped aside.
 */
export type LeftoverOutcome = "continue" | "superseded";
