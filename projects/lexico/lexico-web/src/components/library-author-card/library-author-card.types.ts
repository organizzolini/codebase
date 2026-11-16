import type {
  LibraryMatchRow,
  LibraryTextRow,
} from "../library-grid/library-grid.types";

// 🏷️ Types

/** A book in an Author card, with the Texts under it that the card holds. */
export interface LibraryBookEntry {
  children: LibraryTextRow[];
  id: string;
  kind: "book";
  matches: LibraryMatchRow[];
  slug: string;
  title: string;
}

/** One line of an expanded Author card. */
export type LibraryEntry = LibraryBookEntry | LibraryTextEntry;

/** Several fields' values as one line, with their match ranges moved to fit it. */
export interface LibraryJoinedLine {
  matches: LibraryMatchRow[];
  value: string;
}

/** A Text in an Author card that is not under a book the card lists. */
export interface LibraryTextEntry {
  kind: "text";
  row: LibraryTextRow;
}
