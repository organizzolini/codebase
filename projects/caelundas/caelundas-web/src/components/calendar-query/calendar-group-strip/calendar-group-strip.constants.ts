import { z } from "zod";

// ♟️ Constants

export const TITLE = "Group";

/**
 * What a tag option carries: how far beneath its root it sits.
 */
export const TAG_DEPTH = z.object({ depth: z.number().int().min(0) });

/** A chip styled like the buttons beside it. */
export const CHIP_CLASS_NAME = "bg-background dark:bg-input/30";

/** How many tags a chip names before counting the rest. */
export const NAMED_TAGS = 2;
