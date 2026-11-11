// 🏷️ Types

import type { SearchMatchSource } from "./search.entities";
import type { Connection } from "@codebase/interface";
import type { Lexeme } from "@codebase/lexico-db";

/**
 * Result of Latin enclitic decomposition.
 */
export interface EncliticDecompositionResult {
  enclitic: null | string;
  stem: string;
}

/** One lexeme a search matched, and how, before mapping. */
export interface LexemeSearchMatch {
  distance: null | number;
  enclitic: null | string;
  identifiers: string[];
  lexeme: Lexeme;
  score: number;
  source: SearchMatchSource;
}

/** A search match, keyed by lexeme id. */
export interface RankedLexemeMatch extends LexemeSearchMatch {
  id: string;
}

/** SQL ranking every matched lexeme, with its bound parameters. */
export interface RankedLexemeQuery {
  parameters: Record<string, unknown>;
  sql: string;
}

/** A lexeme on a ranked page, with its best-tier score. */
export interface ScoredLexeme {
  lexeme: Lexeme;
  score: number;
}

/**
 * Payload encoded into search pagination cursors.
 */
export interface SearchCursorPayload {
  id: string;
  score: number;
}

/**
 * One completed dictionary search, as recorded in its log line.
 */
export interface SearchLogEntry {
  connection: Connection<LexemeSearchMatch>;
  language: "english" | "latin";
  query: string;
  startTime: number;
}

/**
 * Options controlling Relay search pagination.
 */
export interface SearchPaginationOptions {
  after?: null | string | undefined;
  before?: null | string | undefined;
  first?: null | number | undefined;
  last?: null | number | undefined;
}
