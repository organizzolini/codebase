import { createServerFn as createServerFunction } from "@tanstack/react-start";
import * as z from "zod/mini";

import { searchDictionary } from "./search.utilities";

import type { LexemeResult } from "../../lexeme/lexeme-card/lexeme-card.types";

// ♟️ Constants

/**
 * Validates the search parameters the route's URL carries.
 */
export const searchSchema = z.object({ query: z.optional(z.string()) });

/** Searches Latin and English together; keeps the higher score. */
export const getSearch = createServerFunction({ method: "GET" })
  .validator(z.object({ query: z.string() }))
  .handler(async ({ data }): Promise<LexemeResult[]> =>
    searchDictionary(data.query),
  );
