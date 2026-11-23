// 🏷️ Types

/**
 * One written form a search matched, with each distinct set of grammatical values it stands for.
 */
export interface MatchedForm {
  /** Each reading of the form as grammatical values, such as `["nominative", "singular"]`. */
  groups: string[][];
  text: string;
}
