import { z } from "zod";

import { SortDirection } from "./sort-direction.entities";

// ♟️ Constants

/** Meanders in a page when `first` is left out. */
export const DEFAULT_PAGE_SIZE = 50;

/** The longest cursor or sort field accepted. */
export const MAXIMUM_TEXT_LENGTH = 512;

/** The most times a drawing may repeat the meander's tile. */
export const MAXIMUM_SVG_REPEATS = 24;

/** The repeats of a drawing when `svg` is given none. */
export const DEFAULT_SVG_REPEATS = 1;

/** Validates how many times `svg` repeats the tile. */
export const svgRepeatsSchema = z
  .number()
  .int()
  .min(1)
  .max(MAXIMUM_SVG_REPEATS);

/** The most meanders one page may hold. */
export const MAXIMUM_PAGE_SIZE = 200;

/** The shape fields a sort may name besides a characteristic key. */
export const SHAPE_SORT_FIELDS = [
  "code",
  "columns",
  "isHardcoded",
  "lattice",
  "repeats",
  "rows",
] as const;

/** What the `meanders` query describes, for the schema. */
export const MEANDERS_QUERY_DESCRIPTION =
  "A page of meanders, sorted by any characteristic or shape field, ties broken by id. A missing characteristic value sorts as 0 or false. Pagination is by keyset cursor.";

/** What the `filter` argument describes, for the schema. */
export const FILTER_ARGUMENT_DESCRIPTION =
  "A tree of and/or groups and rules on shape fields and characteristics. A missing characteristic value reads as 0 or false in every rule.";

/** What the `sort` argument describes, for the schema. */
export const SORT_ARGUMENT_DESCRIPTION =
  "A shape field (code, rows, columns, lattice, repeats, isHardcoded) or a characteristic key, and a direction. Without it, meanders come in id order.";

/** What a cursor records as its filter when the query had none. */
export const NO_FILTER = "none";

/** What a `meanders` query may ask for, checked at the API boundary. */
export const meandersArgumentsSchema = z.object({
  after: z.string().min(1).max(MAXIMUM_TEXT_LENGTH).nullish(),
  first: z
    .number()
    .int()
    .min(1)
    .max(MAXIMUM_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  sort: z
    .object({
      direction: z.enum(SortDirection),
      field: z.string().min(1).max(MAXIMUM_TEXT_LENGTH),
    })
    .nullish(),
});

/** A cursor's sort, filter, last value and id. */
export const cursorSchema = z.object({
  direction: z.enum(SortDirection),
  field: z.string().max(MAXIMUM_TEXT_LENGTH),
  filter: z.string().max(MAXIMUM_TEXT_LENGTH),
  id: z.uuid(),
  value: z.union([z.boolean(), z.number(), z.string()]).nullish(),
});
