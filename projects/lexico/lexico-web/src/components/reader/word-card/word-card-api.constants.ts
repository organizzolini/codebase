import * as z from "zod/mini";

// ♟️ Constants

/** The token a word card looks up, validated at the server function boundary. */
export const getWordCandidatesInputSchema = z.object({
  tokenId: z.string().check(z.minLength(1)),
});
