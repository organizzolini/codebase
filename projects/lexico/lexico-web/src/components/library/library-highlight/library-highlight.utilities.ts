import type { LibraryMatchRow } from "../library-grid/library-grid.types";
import type { HighlightSegment } from "./library-highlight.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Splits a value at the match ranges the API reported for one field. Only the
 * API's offsets are used, so bold text always agrees with what matched.
 */
export function highlightSegments(
  value: string,
  field: string,
  matches: readonly LibraryMatchRow[],
): HighlightSegment[] {
  const bold = Array.from({ length: value.length }, () => false);
  for (const match of matches) {
    if (match.field === field) {
      for (
        let index = Math.max(0, match.start);
        index < Math.min(match.end, value.length);
        index++
      ) {
        bold[index] = true;
      }
    }
  }

  const segments: HighlightSegment[] = [];
  for (let index = 0; index < value.length; index++) {
    const isBold = bold[index] ?? false;
    const last = segments.at(-1);
    if (last?.bold === isBold) {
      last.text += value.charAt(index);
    } else {
      segments.push({ bold: isBold, text: value.charAt(index) });
    }
  }

  return segments;
}
