// 🏷️ Types

/** What the filter form holds before it is applied: ticked values, and typed text. */
export interface LibraryFilterDraft {
  selected: Record<string, string[]>;
  text: Record<string, string>;
}
