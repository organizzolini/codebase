import { z } from "zod";

// ♟️ Constants

/** The most lines one reader request asks the API for. */
export const READER_PAGE_SIZE = 50;

/** Validates what getText is called with. */
export const getTextInputSchema = z.object({
  after: z.string().optional(),
  line: z.number().int().nonnegative().optional(),
  slug: z.string(),
});

/** Validates the search parameters the reader's URL carries. */
export const readerSearchSchema = z.object({
  line: z.coerce.number().int().nonnegative().optional(),
});
