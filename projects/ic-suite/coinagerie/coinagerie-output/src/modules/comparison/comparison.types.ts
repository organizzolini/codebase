// 🏷️ Types

/** How a glossary disagrees with the vocabulary; both lists sorted. */
export interface Comparison {
  /** Words the vocabulary has that the glossary does not list. */
  missing: string[];
  /** Words the glossary lists that the vocabulary no longer has. */
  stale: string[];
}
