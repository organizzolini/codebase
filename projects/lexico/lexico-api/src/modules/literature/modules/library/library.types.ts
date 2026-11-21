import type {
  LibrarySortDirection,
  LibrarySortField,
} from "./library-sort.entities";
import type { Author, AuthorEra, Text } from "@codebase/lexico-db";

/** An author card: the author, what matched, and the top-level works it carries. */
export interface LibraryAuthorRecord {
  readonly author: Author;
  readonly matches: LibraryMatchRange[];
  readonly workCount: number;
  readonly works: LibraryTextRecord[];
}

/** The distinct values of each data-driven filter. */
export interface LibraryFacetsRecord {
  readonly inscriptionTypes: LibraryFacetValueRecord[];
  readonly materials: LibraryFacetValueRecord[];
  readonly provinces: LibraryFacetValueRecord[];
}

/** One distinct value of a Text column and how many Texts carry it. */
export interface LibraryFacetValueRecord {
  readonly count: number;
  readonly value: string;
}

/** Library filters after validation. An absent or empty filter keeps everything. */
export interface LibraryFilters {
  readonly authorYears?: LibraryRange | null | undefined;
  readonly eras?: null | readonly AuthorEra[] | undefined;
  readonly inscriptionTypes?: null | readonly string[] | undefined;
  readonly inscriptionYears?: LibraryRange | null | undefined;
  readonly lineCount?: LibraryRange | null | undefined;
  readonly materials?: null | readonly string[] | undefined;
  readonly printYears?: LibraryRange | null | undefined;
  readonly provinces?: null | readonly string[] | undefined;
  readonly wordCount?: LibraryRange | null | undefined;
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

/** An inclusive range. A missing bound leaves that side open. */
export interface LibraryRange {
  readonly max?: null | number | undefined;
  readonly min?: null | number | undefined;
}

/** How the library is ordered, after validation. */
export interface LibrarySort {
  readonly direction: LibrarySortDirection;
  readonly field: LibrarySortField;
}

/** A sort as a request names it, before validation fills in the direction. */
export interface LibrarySortRequest {
  readonly direction?: LibrarySortDirection | null | undefined;
  readonly field: LibrarySortField;
}

/** A Text a library author card carries, with the spans its search matched. */
export interface LibraryTextRecord {
  readonly childCount: number;
  readonly matches: LibraryMatchRange[];
  readonly text: Text;
}

/** One page of Texts, with how many there are in all. */
export interface LibraryTextsPageRecord {
  readonly pageCount: number;
  readonly texts: LibraryTextRecord[];
  readonly totalCount: number;
}

/** Library arguments after validation, with defaults applied. */
export interface ParsedLibraryArguments {
  readonly filters: LibraryFilters;
  readonly page: number;
  readonly pageSize: number;
  readonly search: null | string;
  readonly sort: readonly LibrarySort[];
}

/** Children arguments after validation, with defaults applied. */
export interface ParsedLibraryChildrenArguments {
  readonly page: number;
  readonly pageSize: number;
  readonly parentTextId: string;
  readonly search: null | string;
}
