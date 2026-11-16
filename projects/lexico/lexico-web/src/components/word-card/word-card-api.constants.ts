import { z } from "zod";

// ♟️ Constants

/** The token a word card looks up, validated at the server function boundary. */
export const getWordCandidatesInputSchema = z.object({
  tokenId: z.string().min(1),
});
