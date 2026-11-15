import { z } from "zod";

// ♟️ Constants

/** The browser storage key the lookup history is kept under. */
export const LOOKUP_HISTORY_KEY = "lexico-lookup-history";

/** The most entries kept; the oldest are dropped first. */
export const LOOKUP_HISTORY_CAP = 200;

/** One stored lookup, validated because storage can hold anything. */
export const lookupEntrySchema = z.object({
  definition: z.string().nullable(),
  form: z.string(),
  line: z.number().int().nonnegative(),
  recordedAt: z.number(),
  slug: z.string(),
  token: z.number().int().nonnegative(),
  word: z.string(),
});

/** The whole stored history, validated as one list. */
export const lookupHistorySchema = z.array(lookupEntrySchema);
