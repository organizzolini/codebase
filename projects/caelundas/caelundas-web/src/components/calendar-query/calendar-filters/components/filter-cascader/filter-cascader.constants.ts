import { z } from "zod";

// ♟️ Constants

/**
 * What a tag option carries: how far beneath its root it sits.
 */
export const OPTION_DEPTH = z.object({ depth: z.number().int().min(0) });

/**
 * Between a field's id and one of its values, in what the list ticks.
 */
export const VALUE_SEPARATOR = "|";

/**
 * The one choice of combining rules: every one of them must hold.
 */
export const COMBINATOR = "and";
