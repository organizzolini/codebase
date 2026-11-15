import type { Author, Text } from "@codebase/lexico-db";

/** An author card: the author, what matched, and the Texts it carries. */
export interface LibraryAuthorRecord {
  readonly author: Author;
  readonly matches: LibraryMatchRange[];
  readonly textCount: number;
  readonly texts: LibraryTextRecord[];
}

/** One matched span of a field, as UTF-16 offsets into its value. */
export interface LibraryMatchRange {
  readonly end: number;
  readonly field: string;
  readonly start: number;
}

/** One page of the library. */
export interface LibraryPageRecord {
  readonly authors: LibraryAuthorRecord[];
  readonly pageCount: number;
  readonly totalCount: number;
}

/** A Text a library author card carries, with the spans its search matched. */
export interface LibraryTextRecord {
  readonly matches: LibraryMatchRange[];
  readonly text: Text;
}

/** Library arguments after validation, with defaults applied. */
export interface ParsedLibraryArguments {
  readonly page: number;
  readonly pageSize: number;
  readonly search: null | string;
}
