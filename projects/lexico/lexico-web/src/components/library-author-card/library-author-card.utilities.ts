import {
  ATTRIBUTE_FIELDS,
  COLLECTION_LABELS,
  JOIN_SEPARATOR,
  JOINED_FIELD,
} from "./library-author-card.constants";

import type {
  LibraryMatchRow,
  LibraryTextRow,
} from "../library-grid/library-grid.types";
import type {
  LibraryBookEntry,
  LibraryEntry,
  LibraryJoinedLine,
} from "./library-author-card.types";

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

/** The collections a card's Texts come from, labelled, without repeats. */
export function collectionsOf(rows: readonly LibraryTextRow[]): string[] {
  const collections = new Set<string>();
  for (const { text } of rows) {
    if (text.collection !== null) {
      collections.add(COLLECTION_LABELS[text.collection] ?? text.collection);
    }
  }
  return [...collections];
}

/**
 * A Text's collection and edition as one line, or the collection alone when
 * it has no edition. Every label is as long as the collection value the API
 * matched against, so its offsets still index the label.
 */
export function editionLine(row: LibraryTextRow): LibraryJoinedLine {
  const { collection, edition } = row.text;
  return joinFields(
    [
      {
        field: "collection",
        value: COLLECTION_LABELS[collection ?? ""] ?? collection,
      },
      { field: "edition", value: edition },
    ],
    row.matches,
  );
}

/** A span of years as a card shows it, such as "70 BCE–19 CE". */
export function formatYears(start: null | number, end: null | number): string {
  return [start, end]
    .filter((year): year is number => year !== null)
    .map((year) => formatYear(year))
    .join("–");
}

/**
 * Groups a card's Texts under their books, in the order the API returned them.
 * A Text whose book is not in the card still gets a book entry for it.
 */
export function groupTexts(rows: readonly LibraryTextRow[]): LibraryEntry[] {
  const entries: LibraryEntry[] = [];
  const books = new Map<string, LibraryBookEntry>();
  const bookFor = (book: LibraryBookEntry): LibraryBookEntry => {
    const existing = books.get(book.id);
    if (existing !== undefined) {
      return existing;
    }
    books.set(book.id, book);
    entries.push(book);
    return book;
  };

  for (const row of rows) {
    const { matches, text } = row;

    if (text.type === "book") {
      bookFor({
        children: [],
        id: text.id,
        kind: "book",
        matches,
        slug: text.slug,
        title: text.title,
      });
    } else if (text.parentText === null) {
      entries.push({ kind: "text", row });
    } else {
      bookFor({
        children: [],
        id: text.parentText.id,
        kind: "book",
        matches: [],
        slug: text.parentText.slug,
        title: text.parentText.title,
      }).children.push(row);
    }
  }

  return entries;
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
