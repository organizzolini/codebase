import { createServerFn as createServerFunction } from "@tanstack/react-start";
import { z } from "zod";

import { searchDictionary } from "./search.utilities";

import type { LexemeResult } from "../lexeme-card/lexeme-card.types";

// ♟️ Constants

/**
 * Validates the search parameters the route's URL carries.
 */
export const searchSchema = z.object({ query: z.string().optional() });

/**
 * Searches Latin and English at once, since a query carries no language label.
 * A lexeme both searches find keeps its higher score.
 */
export const getSearch = createServerFunction({ method: "GET" })
  .validator(z.object({ query: z.string() }))
  .handler(async ({ data }): Promise<LexemeResult[]> =>
    searchDictionary(data.query),
  );
