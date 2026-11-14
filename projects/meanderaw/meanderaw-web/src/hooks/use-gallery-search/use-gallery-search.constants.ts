import { z } from "zod";

import {
  linkedFilterSchema,
  MAXIMUM_FILTER_TEXT_LENGTH,
} from "../../components/gallery-filter-builder/gallery-filter-builder.constants";
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
  // A level that is no text is dropped alone, and the rest capped after.
  group: z
    .array(z.unknown())
    .transform((levels) =>
      levels
        .filter(
          (level): level is string =>
            typeof level === "string" &&
            level.length > 0 &&
            level.length <= MAXIMUM_FILTER_TEXT_LENGTH,
        )
        .slice(0, MAXIMUM_GROUP_LEVELS),
    )
    .catch([])
    .optional(),
  sort: z.coerce.string().min(1).optional(),
  view: z.enum(GALLERY_VIEWS).catch(DEFAULT_GALLERY_VIEW).optional(),
});
