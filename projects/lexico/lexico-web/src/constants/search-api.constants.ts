import { z } from "zod";

import type { ResultNode } from "../types/search.types";

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
