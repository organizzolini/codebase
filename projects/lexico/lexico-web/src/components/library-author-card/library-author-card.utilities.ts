import { COLLECTION_LABELS } from "./library-author-card.constants";

import type { LibraryTextRow } from "../library-grid/library-grid.types";
import type {
  LibraryBookEntry,
  LibraryEntry,
} from "./library-author-card.types";

// 🔏 Private Functions

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

// 🌎 Public Functions

/** A Text's collection and edition, or the collection alone when it has no edition. */
export function editionLabel(row: LibraryTextRow): string {
  const { collection, edition } = row.text;
  const label = COLLECTION_LABELS[collection ?? ""] ?? collection ?? "";
  return edition === null ? label : `${label} · ${edition}`;
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
