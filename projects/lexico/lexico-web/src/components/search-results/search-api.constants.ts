import { z } from "zod";

import type { LexemeMatchKind } from "../lexeme-match/lexeme-match.types";
import type { ResultNode } from "./search.types";

// ♟️ Constants

/**
 * Where the lexico API serves GraphQL when `LEXICO_API_URL` is not set.
 */
export const DEFAULT_LEXICO_API_URL = "http://localhost:5003/graphql";

/**
 * The most lexemes one language's search is asked for.
 */
export const SEARCH_PAGE_SIZE = 24;

/**
 * Validates one language's search results as the API answers them.
 */
export const connectionSchema = z.object({
  edges: z.array(z.object({ node: z.custom<ResultNode>() })),
});

/** Match kind an API tier without a score stands for. */
export const MATCH_KINDS: Readonly<Partial<Record<string, LexemeMatchKind>>> = {
  ENCLITIC: "enclitic",
  LEMMA_EXACT: "exact-lemma",
  TRANSLATION_EXACT: "translation-exact",
  TRANSLATION_PREFIX: "translation-prefix",
  WORD_EXACT: "exact-form",
};
