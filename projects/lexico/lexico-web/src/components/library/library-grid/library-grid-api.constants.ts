import * as z from "zod/mini";

import {
  AuthorEra,
  LibrarySortDirection,
  LibrarySortField,
} from "../../../graphql/generated/operations";

// ♟️ Constants

/** The authors-per-page choices the Page menu offers. */
export const LIBRARY_LIMITS: readonly number[] = [10, 25, 50, 100];

/** Authors on one library page unless the URL asks for another limit. */
export const LIBRARY_PAGE_SIZE = 25;

/** One whole-number bound of a range filter; anything else is dropped. */
const bound = z.catch(z.optional(z.int()), (): undefined => undefined);

/** A list of free-text values; an empty or malformed list is dropped. */
const textList = z.catch(
  z.optional(z.array(z.string().check(z.minLength(1))).check(z.minLength(1))),
  (): undefined => undefined,
);

/** The filters the library URL carries, flat, with a bad value dropped to no filter. */
export const libraryFilterShape = {
  authorYearsMaximum: bound,
  authorYearsMinimum: bound,
  eras: z.catch(
    z.optional(z.array(z.enum(AuthorEra)).check(z.minLength(1))),
    (): undefined => undefined,
  ),
  inscriptionTypes: textList,
  inscriptionYearsMaximum: bound,
  inscriptionYearsMinimum: bound,
  lineCountMaximum: bound,
  lineCountMinimum: bound,
  materials: textList,
  printYearsMaximum: bound,
  printYearsMinimum: bound,
  provinces: textList,
  wordCountMaximum: bound,
  wordCountMinimum: bound,
};

/** Validates the filters alone, dropping each bad one. */
export const libraryFilterSchema = z.object(libraryFilterShape);

/** Validates the search parameters the library URL carries; a bad value falls back to its default. */
export const librarySearchSchema = z.object({
  ...libraryFilterShape,
  direction: z.catch(
    z.optional(z.enum(LibrarySortDirection)),
    (): undefined => undefined,
  ),
  limit: z.catch(
    z.optional(
      z.coerce
        .number()
        .check(z.refine((value) => LIBRARY_LIMITS.includes(value))),
    ),
    (): undefined => undefined,
  ),
  page: z.catch(
    z.optional(
      z.coerce.number().check(z.refine(Number.isInteger), z.positive()),
    ),
    (): undefined => undefined,
  ),
  search: z.catch(
    z.optional(
      z.pipe(
        z.transform((value) =>
          typeof value === "number" ? String(value) : value,
        ),
        z.string(),
      ),
    ),
    (): undefined => undefined,
  ),
  sort: z.catch(
    z.optional(z.enum(LibrarySortField)),
    (): undefined => undefined,
  ),
});

/** Validates what getLibrary is called with. */
export const getLibraryInputSchema = z.object({
  ...libraryFilterShape,
  direction: librarySearchSchema.shape.direction,
  limit: librarySearchSchema.shape.limit,
  page: z.int().check(z.positive()),
  search: z.string(),
  sort: librarySearchSchema.shape.sort,
});
