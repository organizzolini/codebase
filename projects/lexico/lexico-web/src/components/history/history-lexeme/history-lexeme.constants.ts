import { createServerFn as createServerFunction } from "@tanstack/react-start";

import { getHistoryLexemeInputSchema } from "./history-lexeme-api.constants";
import { findHistoryLexeme } from "./history-lexeme.utilities";

import type { LexemeResult } from "../../lexeme/lexeme-card/lexeme-card.types";

// ♟️ Constants

/**
 * Loads the lexeme a history entry recorded, as a search result card shows it.
 */
export const getHistoryLexeme = createServerFunction({ method: "GET" })
  .validator(getHistoryLexemeInputSchema)
  .handler(async ({ data }): Promise<LexemeResult | null> =>
    findHistoryLexeme(data),
  );

/** What a card slot says while it has no lexeme to show. */
export const HISTORY_LEXEME_STATUS = {
  failed: "Could not load this entry.",
  loading: "Loading the entry…",
  missing: "This word is not in the dictionary.",
} as const;
