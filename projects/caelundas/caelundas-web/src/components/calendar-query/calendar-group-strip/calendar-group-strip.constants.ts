import { z } from "zod";

// ♟️ Constants

export const TITLE = "Group";

/**
 * Joins the trigger to its chips: flat inner edges, one border between.
 */
export const STRIP_CLASS_NAME =
  "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none";

/**
 * What a tag option carries: how far beneath its root it sits.
 */
export const TAG_DEPTH = z.object({ depth: z.number().int().min(0) });

/**
 * A chip looks like the buttons beside it, not shaded as set apart.
 */
export const CHIP_CLASS_NAME = "bg-background dark:bg-input/30";
