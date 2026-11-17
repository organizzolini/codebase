import type { LexemeResult } from "../lexeme-card/lexeme-card.types";
import type { getHistoryLexemeInputSchema } from "./history-lexeme-api.constants";
import type * as z from "zod/mini";

// 🏷️ Types

/** What getHistoryLexeme is called with. */
export type HistoryLexemeInput = z.infer<typeof getHistoryLexemeInputSchema>;

/** Where loading the entry's lexeme stands. */
export type HistoryLexemeState =
  | { lexeme: LexemeResult; status: "ready" }
  | { status: "failed" }
  | { status: "loading" }
  | { status: "missing" };
