import * as z from "zod/mini";

// ♟️ Constants

/** The most lines one reader request asks the API for. */
export const READER_PAGE_SIZE = 50;

/** Validates what getText is called with. */
export const getTextInputSchema = z.object({
  after: z.optional(z.string()),
  line: z.optional(z.int().check(z.nonnegative())),
  slug: z.string(),
});

/** Validates the search parameters the reader's URL carries. */
export const readerSearchSchema = z.object({
  line: z.optional(
    z.coerce.number().check(z.refine(Number.isInteger), z.nonnegative()),
  ),
});
