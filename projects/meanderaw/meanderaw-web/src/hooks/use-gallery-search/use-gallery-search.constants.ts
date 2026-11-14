import { z } from "zod";

import { linkedFilterSchema } from "../../components/gallery-filter-builder/gallery-filter-builder.constants";
import { MAXIMUM_GROUP_LEVELS } from "../../components/gallery-group-by/gallery-group-by.constants";

// ♟️ Constants

/**
 * The two ways the gallery lays its cards out.
 */
export const GALLERY_VIEWS = ["grid", "list"] as const;

/**
 * The view a link opens on when it names none.
 */
export const DEFAULT_GALLERY_VIEW = "grid" as const;

/**
 * The two ways a sort runs, as a link names them.
 */
export const SORT_DIRECTIONS = ["asc", "desc"] as const;

/**
 * The way a sort runs when a link names an invalid direction.
 */
export const DEFAULT_SORT_DIRECTION = "asc" as const;

/**
 * Validates the link's search parameters, repairing invalid ones.
 */
export const gallerySearchSchema = z.object({
  direction: z.enum(SORT_DIRECTIONS).catch(DEFAULT_SORT_DIRECTION).optional(),
  filter: linkedFilterSchema.optional(),
  group: z
    .array(z.string().min(1))
    .transform((levels) => levels.slice(0, MAXIMUM_GROUP_LEVELS))
    .catch([])
    .optional(),
  sort: z.coerce.string().min(1).optional(),
  view: z.enum(GALLERY_VIEWS).catch(DEFAULT_GALLERY_VIEW).optional(),
});
