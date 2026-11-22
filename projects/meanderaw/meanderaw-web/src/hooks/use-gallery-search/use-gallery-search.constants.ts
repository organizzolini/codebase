import { z } from "zod";

import {
  linkedFilterSchema,
  linkedRowsSchema,
  MAXIMUM_FILTER_TEXT_LENGTH,
} from "../../components/gallery/gallery-filters/components/filter-model/filter-model.constants";
import { MAXIMUM_GROUP_LEVELS } from "../../components/gallery/gallery-group-by/gallery-group-by.constants";

import { readSorts } from "./use-gallery-search.utilities";

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
 * The field a link sorts by when it names none.
 */
export const DEFAULT_SORT_FIELD = "rows";

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
 * The page sizes on offer.
 */
export const PAGE_SIZES: readonly number[] = [12, 24, 48, 96];

/**
 * The page size a link opens on by default.
 */
export const DEFAULT_PAGE_SIZE = 24;

/**
 * The field a link groups by when it names no grouping.
 */
export const DEFAULT_GROUP_FIELD = "rows";

/**
 * The most fields one sort may name.
 */
export const MAXIMUM_SORTS = 4;

/**
 * The sort a link opens on when it names none: rows ascending.
 */
export const DEFAULT_SORTS = [
  { direction: DEFAULT_SORT_DIRECTION, field: DEFAULT_SORT_FIELD },
] as const;

/**
 * Validates the link's search parameters, repairing invalid ones.
 */
export const gallerySearchSchema = z
  .object({
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
    repeats: z.coerce
      .number()
      .int()
      .min(MINIMUM_REPEATS)
      .max(MAXIMUM_REPEATS)
      .catch(DEFAULT_REPEATS)
      .optional(),
    rows: linkedRowsSchema.optional(),
    size: z.coerce
      .number()
      .refine((size) => PAGE_SIZES.includes(size))
      .catch(DEFAULT_PAGE_SIZE)
      .optional(),
    // A list of fields with directions; a lone field name, as old links wrote
    // it, takes the link's `direction`.
    sort: z.union([z.array(z.unknown()), z.coerce.string().min(1)]).optional(),
    view: z.enum(GALLERY_VIEWS).catch(DEFAULT_GALLERY_VIEW).optional(),
  })
  .transform(({ direction, sort, ...rest }) => {
    const sorts = readSorts({ direction, maximum: MAXIMUM_SORTS, sort });

    const parsed: typeof rest & {
      sort?: undefined | { direction: "asc" | "desc"; field: string }[];
    } = rest;

    if (sorts.length > 0) {
      parsed.sort = sorts;
    }

    return parsed;
  });
