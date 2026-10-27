import { createServerFn as createServerFunction } from "@tanstack/react-start";
import { z } from "zod";

import { searchDictionary } from "../utilities/search.utilities";

import type { LexemeResult } from "../components/lexeme-card.types";

// ♟️ Constants

/**
 * Validates the search parameters the route's URL carries.
 */
export const searchSchema = z.object({ query: z.string().optional() });

/**
 * Searches the dictionary in Latin and in English at once, since a query is
 * not labeled with the language it is written in, and merges what both find,
 * best match first. A lexeme both searches found keeps its higher score.
 */
export const getSearch = createServerFunction({ method: "GET" })
  .validator(z.object({ query: z.string() }))
  .handler(async ({ data }): Promise<LexemeResult[]> =>
    searchDictionary(data.query),
  );
