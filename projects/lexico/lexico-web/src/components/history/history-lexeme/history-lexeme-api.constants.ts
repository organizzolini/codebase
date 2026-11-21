import * as z from "zod/mini";

// ♟️ Constants

/** The word a history entry recorded, validated at the server function boundary. */
export const getHistoryLexemeInputSchema = z.object({
  form: z.optional(z.nullable(z.string())),
  lexemeId: z.optional(z.nullable(z.string())),
  word: z.string().check(z.minLength(1)),
});
