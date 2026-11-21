import { z } from "zod";

import { authorEra, textCollection } from "@codebase/lexico-db";

import {
  LibrarySortDirection,
  LibrarySortField,
} from "./library-sort.entities";

/** The page a library request gets when it names no page size. */
export const LIBRARY_DEFAULT_PAGE_SIZE = 24;

/** The most authors one library page may hold. */
export const LIBRARY_MAX_PAGE_SIZE = 100;

/**
 * The most top-level works one author card carries. `workCount` still
 * reports every work in scope, and `libraryWorks` pages the rest.
 */
export const LIBRARY_WORKS_PER_AUTHOR = 50;

/** The children one `libraryChildren` page holds when it names no size. */
export const LIBRARY_CHILDREN_PAGE_SIZE = 100;

/** The longest search string, or filter value, a library request may send. */
export const LIBRARY_MAX_SEARCH_LENGTH = 200;

/** The most values a list filter may name. */
export const LIBRARY_MAX_FILTER_VALUES = 100;

/** The order a library page takes when it names none: authors by name. */
export const LIBRARY_DEFAULT_SORT = {
  direction: LibrarySortDirection.ASC,
  field: LibrarySortField.AUTHOR_NAME,
} as const;

/** Text columns a library search matches, besides the collection. */
export const LIBRARY_TEXT_SEARCH_COLUMNS = [
  "title",
  "edition",
  "editors",
  "province",
  "find_spot",
  "inscription_type",
  "material",
] as const;

/**
 * Where each sortable attribute lives: on the author, or on the Texts it
 * carries, and in which column.
 */
export const LIBRARY_SORT_COLUMNS: Record<
  LibrarySortField,
  { readonly column: string; readonly scope: "author" | "text" }
> = {
  [LibrarySortField.AUTHOR_END_YEAR]: { column: "end_year", scope: "author" },
  [LibrarySortField.AUTHOR_ERA]: { column: "era", scope: "author" },
  [LibrarySortField.AUTHOR_FULL_NAME]: { column: "full_name", scope: "author" },
  [LibrarySortField.AUTHOR_NAME]: { column: "name", scope: "author" },
  [LibrarySortField.AUTHOR_START_YEAR]: {
    column: "start_year",
    scope: "author",
  },
  [LibrarySortField.TEXT_COLLECTION]: { column: "collection", scope: "text" },
  [LibrarySortField.TEXT_EDITION]: { column: "edition", scope: "text" },
  [LibrarySortField.TEXT_END_YEAR]: { column: "end_year", scope: "text" },
  [LibrarySortField.TEXT_LINE_COUNT]: { column: "line_count", scope: "text" },
  [LibrarySortField.TEXT_PRINT_YEAR]: { column: "print_year", scope: "text" },
  [LibrarySortField.TEXT_RECOGNISED_WORD_COUNT]: {
    column: "recognised_word_count",
    scope: "text",
  },
  [LibrarySortField.TEXT_START_YEAR]: { column: "start_year", scope: "text" },
  [LibrarySortField.TEXT_TITLE]: { column: "title", scope: "text" },
  [LibrarySortField.TEXT_WORD_COUNT]: { column: "word_count", scope: "text" },
};

/**
 * The explicit order of the enum-valued sort fields, first to last: eras run
 * chronologically, collections from the general corpora to the specialist
 * ones. A sort ranks by this list and never by the database's enum order or
 * the alphabet.
 */
export const LIBRARY_SORT_RANKS: Partial<
  Record<LibrarySortField, readonly string[]>
> = {
  [LibrarySortField.AUTHOR_ERA]: [
    authorEra.archaic,
    authorEra.classical,
    authorEra.imperial,
    authorEra.late,
    authorEra.medieval,
    authorEra.neoLatin,
  ],
  [LibrarySortField.TEXT_COLLECTION]: [
    textCollection.perseus,
    textCollection.theLatinLibrary,
    textCollection.csel,
    textCollection.edcs,
  ],
};

/** A text value a filter or search may hold. */
const textSchema = z.string().max(LIBRARY_MAX_SEARCH_LENGTH);

/** One author era, as the stored value. */
const eraSchema = z.enum(authorEra);

/** An inclusive range, with the check that its bounds are in order. */
const rangeSchema = z
  .object({
    max: z.number().int().nullish(),
    min: z.number().int().nullish(),
  })
  .refine(
    (range) =>
      typeof range.min !== "number" ||
      typeof range.max !== "number" ||
      range.min <= range.max,
    { message: "A range's min must not exceed its max" },
  );

/** Validates the filters; an absent filter keeps every author and Text. */
const filtersSchema = z
  .object({
    authorYears: rangeSchema.nullish(),
    eras: z.array(eraSchema).max(LIBRARY_MAX_FILTER_VALUES).nullish(),
    inscriptionTypes: z
      .array(textSchema)
      .max(LIBRARY_MAX_FILTER_VALUES)
      .nullish(),
    inscriptionYears: rangeSchema.nullish(),
    lineCount: rangeSchema.nullish(),
    materials: z.array(textSchema).max(LIBRARY_MAX_FILTER_VALUES).nullish(),
    printYears: rangeSchema.nullish(),
    provinces: z.array(textSchema).max(LIBRARY_MAX_FILTER_VALUES).nullish(),
    wordCount: rangeSchema.nullish(),
  })
  .nullish();

/** Validates the sort; an absent direction is ascending. */
const sortSchema = z
  .object({
    direction: z.enum(LibrarySortDirection).nullish(),
    field: z.enum(LibrarySortField),
  })
  .nullish();

/** Validates the arguments of one page of a Text's children. */
export const libraryChildrenArgumentsSchema = z.object({
  page: z.number().int().min(1).nullish(),
  pageSize: z.number().int().min(1).max(LIBRARY_MAX_PAGE_SIZE).nullish(),
  parentTextId: z.string().min(1),
  search: textSchema.nullish(),
});

/** Validates library arguments; absent options take their defaults. */
export const libraryArgumentsSchema = z.object({
  filters: filtersSchema,
  page: z.number().int().min(1).nullish(),
  pageSize: z.number().int().min(1).max(LIBRARY_MAX_PAGE_SIZE).nullish(),
  search: textSchema.nullish(),
  sort: sortSchema,
});
