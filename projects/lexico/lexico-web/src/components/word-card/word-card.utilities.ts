import { WordCandidatesDocument } from "../../graphql/generated/operations";
import { queryApi } from "../search-results/search.utilities";

import type { WordCandidate, WordCardStatus } from "./word-card.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The reading the card shows: the only one when there is one, otherwise the
 * one the reader chose.
 */
export function chooseCandidate(
  candidates: null | WordCandidate[],
  chosen: null | number,
): undefined | WordCandidate {
  if (candidates === null) {
    return undefined;
  }
  if (candidates.length === 1) {
    return candidates[0];
  }
  return chosen === null ? undefined : candidates[chosen];
}

/**
 * The status line to show in place of readings, or null when there are
 * readings to show.
 */
export function describeStatus(
  candidates: null | WordCandidate[],
  hasFailed: boolean,
): null | WordCardStatus {
  if (hasFailed) {
    return { isError: true, text: "Could not look up this word. Try again." };
  }
  if (candidates === null) {
    return { isError: false, text: "Looking up the word…" };
  }
  if (candidates.length === 0) {
    return { isError: false, text: "This word is not in the dictionary." };
  }
  return null;
}

/**
 * Lists the readings a token's word can take, following the token's stored
 * link to its word. Rejects when the API cannot be reached.
 */
export async function findWordCandidates(
  tokenId: string,
): Promise<WordCandidate[]> {
  const { wordCandidates } = await queryApi(WordCandidatesDocument, {
    tokenId,
  });
  return wordCandidates;
}
