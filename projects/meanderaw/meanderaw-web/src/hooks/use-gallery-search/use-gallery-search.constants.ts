import { z } from "zod";

import {
  linkedFilterSchema,
  linkedRowsSchema,
} from "../../components/gallery-filter-builder/gallery-filter-builder.constants";

// ♟️ Constants

/**
 * The two ways the gallery lays its cards out.
 */
export const GALLERY_VIEWS = ["grid", "list"] as const;

/**
 * The view a link opens on when it names none.
 */
export const DEFAULT_GALLERY_VIEW = "list" as const;

/**
 * The two ways a sort runs, as a link names them.
 */
export const SORT_DIRECTIONS = ["asc", "desc"] as const;

/**
 * The way a sort runs when a link names an invalid direction.
 */
export const DEFAULT_SORT_DIRECTION = "asc" as const;

/**
 * The fewest times a drawing may repeat its tile.
 */
export const MINIMUM_REPEATS = 1;

/**
 * The most repeats, as the API's `MAXIMUM_SVG_REPEATS` allows.
 */
export const MAXIMUM_REPEATS = 24;

/**
 * Repeats a link opens on when it names no valid count.
 */
export const DEFAULT_REPEATS = 12;

/**
 * Validates the link's search parameters, repairing invalid ones.
 */
export const gallerySearchSchema = z.object({
  direction: z.enum(SORT_DIRECTIONS).catch(DEFAULT_SORT_DIRECTION).optional(),
  filter: linkedFilterSchema.optional(),
  repeats: z.coerce
    .number()
    .int()
    .min(MINIMUM_REPEATS)
    .max(MAXIMUM_REPEATS)
    .catch(DEFAULT_REPEATS)
    .optional(),
  rows: linkedRowsSchema.optional(),
  sort: z.coerce.string().min(1).optional(),
  view: z.enum(GALLERY_VIEWS).catch(DEFAULT_GALLERY_VIEW).optional(),
});
