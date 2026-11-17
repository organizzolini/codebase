import * as z from "zod/mini";

// ♟️ Constants

/** The browser storage key the lookup history is kept under. */
export const LOOKUP_HISTORY_KEY = "lexico-lookup-history";

/** The most entries kept, lookups and searches together. */
export const LOOKUP_HISTORY_CAP = 200;

/** One stored word lookup; a missing kind reads as a lookup. */
export const lookupEntrySchema = z.object({
  definition: z.nullable(z.string()),
  form: z.string(),
  kind: z._default(z.literal("lookup"), "lookup"),
  lexemeId: z.optional(z.nullable(z.string())),
  line: z.int().check(z.nonnegative()),
  recordedAt: z.number(),
  slug: z.string(),
  title: z.optional(z.string()),
  token: z.int().check(z.nonnegative()),
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

/** The stored list before its entries are checked one by one. */
export const storedListSchema = z.array(z.unknown());
