import type { LexemeMatchInfo } from "./lexeme-match.types";

// 🔏 Private Functions

// 🌎 Public Functions

// 🛠 Utilities

/**
 * Says how far a match is from the query: its edit distance when fuzzy, or the
 * letters a headword has beyond it.
 */
export function describeExtent(match: LexemeMatchInfo): string {
  if (match.distance !== undefined) {
    return ` (${String(match.distance)} ${match.distance === 1 ? "edit" : "edits"} away)`;
  }
  if (match.extraLetters === undefined || match.extraLetters === 0) {
    return "";
  }
  return ` (+${String(match.extraLetters)} ${match.extraLetters === 1 ? "letter" : "letters"})`;
}
