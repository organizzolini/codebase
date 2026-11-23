import {
  ATTRIBUTE_FIELDS,
  JOIN_SEPARATOR,
  JOINED_FIELD,
} from "./library-author-card.constants";

import type {
  LibraryMatchRow,
  LibraryTextRow,
} from "../library-grid/library-grid.types";
import type { LibraryJoinedLine } from "./library-author-card.types";

// 🔏 Private Functions

/**
 * The inscription attributes a search matched, as one line. An attribute that
 * did not match is left out, so every shown value says why the Text was found.
 */
export function attributeLine(row: LibraryTextRow): LibraryJoinedLine {
  return joinFields(
    ATTRIBUTE_FIELDS.filter((field) =>
      row.matches.some((match) => match.field === field),
    ).map((field) => ({ field, value: row.text[field] })),
    row.matches,
  );
}

// 🌎 Public Functions

/** A Text's line and word counts as one string, empty when it has neither. */
export function countsOf(text: LibraryTextRow["text"]): string {
  return [
    text.lineCount === null ? "" : `${String(text.lineCount)} lines`,
    text.wordCount === null ? "" : `${String(text.wordCount)} words`,
  ]
    .filter((part) => part !== "")
    .join(" · ");
}

/** A span of years as a card shows it, such as "70 BCE–19 CE". */
export function formatYears(start: null | number, end: null | number): string {
  return [start, end]
    .filter((year): year is number => year !== null)
    .map((year) => formatYear(year))
    .join("–");
}

/**
 * The works of a card as one bullet-separated line, each title once, with a
 * trailing "+N more" when the card holds more works than it lists.
 */
export function previewOf(
  works: readonly LibraryTextRow[],
  workCount: number,
): string {
  const titles = [...new Set(works.map(({ text }) => text.title))];
  const remaining = workCount - works.length;
  return `${titles.join(" • ")}${remaining > 0 ? ` • +${String(remaining)} more` : ""}`;
}

/** A year as the era labels it: BCE for negative years. */
function formatYear(year: number): string {
  return year < 0 ? `${String(-year)} BCE` : `${String(year)} CE`;
}

/**
 * Joins the non-empty values of several fields into one line, moving each
 * field's match ranges to where its value now sits in that line.
 */
function joinFields(
  parts: readonly { field: string; value: null | string | undefined }[],
  matches: readonly LibraryMatchRow[],
): LibraryJoinedLine {
  const joined: LibraryMatchRow[] = [];
  const values: string[] = [];
  let offset = 0;

  for (const { field, value } of parts) {
    if (value === null || value === undefined || value === "") {
      continue;
    }
    for (const match of matches) {
      if (match.field === field) {
        joined.push({
          end: match.end + offset,
          field: JOINED_FIELD,
          start: match.start + offset,
        });
      }
    }
    values.push(value);
    offset += value.length + JOIN_SEPARATOR.length;
  }

  return { matches: joined, value: values.join(JOIN_SEPARATOR) };
}
