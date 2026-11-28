import { z } from "zod";

// ♟️ Constants

/**
 * What a tag option carries: how far beneath its root it sits.
 */
export const OPTION_DEPTH = z.object({ depth: z.number().int().min(0) });

/** The separator between a field's id and a value. */
export const VALUE_SEPARATOR = "|";

/**
 * The one choice of combining rules: every one of them must hold.
 */
export const COMBINATOR = "and";

/**
 * The Tag row, holding the tag roots, which only opens.
 */
export const TAG_PARENT_VALUE = `field${VALUE_SEPARATOR}tag:*`;
