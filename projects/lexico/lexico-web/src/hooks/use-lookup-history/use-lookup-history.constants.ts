import { z } from "zod";

// ♟️ Constants

/** The browser storage key the lookup history is kept under. */
export const LOOKUP_HISTORY_KEY = "lexico-lookup-history";

/**
 * The most entries kept, lookups and searches together; the oldest are
 * dropped first.
 */
export const LOOKUP_HISTORY_CAP = 200;

/**
 * One stored word lookup, validated because storage can hold anything. Entries
 * stored before searches were kept have no kind, and are read as lookups.
 */
export const lookupEntrySchema = z.object({
  definition: z.string().nullable(),
  form: z.string(),
  kind: z.literal("lookup").default("lookup"),
  line: z.number().int().nonnegative(),
  recordedAt: z.number(),
  slug: z.string(),
  title: z.string().optional(),
  token: z.number().int().nonnegative(),
  word: z.string(),
});

/** One stored dictionary search. */
export const searchEntrySchema = z.object({
  kind: z.literal("search"),
  query: z.string(),
  recordedAt: z.number(),
});

/** One stored history entry, of either kind. */
export const historyEntrySchema = z.union([
  lookupEntrySchema,
  searchEntrySchema,
]);

/** The whole stored history, validated as one list. */
export const lookupHistorySchema = z.array(historyEntrySchema);
