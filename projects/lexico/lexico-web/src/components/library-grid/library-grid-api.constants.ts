import { z } from "zod";

// ♟️ Constants

/** Authors on one library page. */
export const LIBRARY_PAGE_SIZE = 24;

/** Validates the search parameters the library URL carries; a bad value falls back to its default. */
export const librarySearchSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .catch((): undefined => undefined),
  search: z
    .preprocess(
      (value) => (typeof value === "number" ? String(value) : value),
      z.string(),
    )
    .optional()
    .catch((): undefined => undefined),
});

/** Validates what getLibrary is called with. */
export const getLibraryInputSchema = z.object({
  page: z.number().int().positive(),
  search: z.string(),
});
