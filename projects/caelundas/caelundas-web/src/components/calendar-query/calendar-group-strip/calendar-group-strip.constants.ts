import { z } from "zod";

// ♟️ Constants

export const TITLE = "Group";

/**
 * What a tag option carries: how far beneath its root it sits.
 */
export const TAG_DEPTH = z.object({ depth: z.number().int().min(0) });

/**
 * A chip looks like the buttons beside it, not shaded as set apart.
 */
export const CHIP_CLASS_NAME = "bg-background dark:bg-input/30";

/**
 * How many of the tags a level goes by its chip names before it counts the rest.
 */
export const NAMED_TAGS = 2;
