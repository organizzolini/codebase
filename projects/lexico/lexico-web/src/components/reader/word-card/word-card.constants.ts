import { createServerFn as createServerFunction } from "@tanstack/react-start";

import { getWordCandidatesInputSchema } from "./word-card-api.constants";
import { findWordCandidates } from "./word-card.utilities";

// ♟️ Constants

/**
 * Looks up the readings of one clicked word, for the word card.
 */
export const getWordCandidates = createServerFunction({ method: "GET" })
  .validator(getWordCandidatesInputSchema)
  .handler(async ({ data }) => findWordCandidates(data.tokenId));
