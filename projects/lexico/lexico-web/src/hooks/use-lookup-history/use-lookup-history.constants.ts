import * as z from "zod/mini";

// ♟️ Constants

/** The browser storage key the lookup history is kept under. */
export const LOOKUP_HISTORY_KEY = "lexico-lookup-history";

/** The most entries kept, lookups, searches, and text openings together. */
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

/** One stored opening of a text in the reader. */
export const textEntrySchema = z.object({
  authorName: z.string(),
  kind: z.literal("text"),
  recordedAt: z.number(),
  slug: z.string(),
  title: z.string(),
});

/** One stored history entry, of any kind. */
export const historyEntrySchema = z.union([
  lookupEntrySchema,
  searchEntrySchema,
  textEntrySchema,
]);

/** The stored list before its entries are checked one by one. */
export const storedListSchema = z.array(z.unknown());
