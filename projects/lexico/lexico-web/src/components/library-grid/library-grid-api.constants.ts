import { z } from "zod";

import {
  AuthorEra,
  LibrarySortDirection,
  LibrarySortField,
  LibraryTextKind,
  TextCollection,
} from "../../graphql/generated/operations";

// ♟️ Constants

/** Authors on one library page. */
export const LIBRARY_PAGE_SIZE = 24;

/** One whole-number bound of a range filter; anything else is dropped. */
const bound = z
  .number()
  .int()
  .optional()
  .catch((): undefined => undefined);

/** A list of free-text values; an empty or malformed list is dropped. */
const textList = z
  .array(z.string().min(1))
  .min(1)
  .optional()
  .catch((): undefined => undefined);

/** The filters the library URL carries, flat, with a bad value dropped to no filter. */
export const libraryFilterShape = {
  authorYearsMaximum: bound,
  authorYearsMinimum: bound,
  collections: z
    .array(z.enum(TextCollection))
    .min(1)
    .optional()
    .catch((): undefined => undefined),
  eras: z
    .array(z.enum(AuthorEra))
    .min(1)
    .optional()
    .catch((): undefined => undefined),
  inscriptionTypes: textList,
  inscriptionYearsMaximum: bound,
  inscriptionYearsMinimum: bound,
  kinds: z
    .array(z.enum(LibraryTextKind))
    .min(1)
    .optional()
    .catch((): undefined => undefined),
  lineCountMaximum: bound,
  lineCountMinimum: bound,
  materials: textList,
  printYearsMaximum: bound,
  printYearsMinimum: bound,
  provinces: textList,
  wordCountMaximum: bound,
  wordCountMinimum: bound,
};

/** Validates the search parameters the library URL carries; a bad value falls back to its default. */
export const librarySearchSchema = z.object({
  ...libraryFilterShape,
  direction: z
    .enum(LibrarySortDirection)
    .optional()
    .catch((): undefined => undefined),
  page: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .catch((): undefined => undefined),
  search: z
    .string()
    .optional()
    .catch((): undefined => undefined),
  sort: z
    .enum(LibrarySortField)
    .optional()
    .catch((): undefined => undefined),
});

/** Validates what getLibrary is called with. */
export const getLibraryInputSchema = z.object({
  ...libraryFilterShape,
  direction: librarySearchSchema.shape.direction,
  page: z.number().int().positive(),
  search: z.string(),
  sort: librarySearchSchema.shape.sort,
});
