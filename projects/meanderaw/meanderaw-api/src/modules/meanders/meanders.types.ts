// 🏷️ Types

import type { cursorSchema, SHAPE_SORT_FIELDS } from "./meanders.constants";
import type { MeanderFilterGroupInput } from "./modules/filters/meander-filter.entities";
import type { MeanderSortInput } from "./modules/sorting/meander-sort.entities";
import type { z } from "zod";

/** What a cursor carries, as read back. */
export type Cursor = z.infer<typeof cursorSchema>;

/** What a `meanders` query asks for. */
export interface MeandersArguments {
  readonly after?: null | string | undefined;
  readonly filter?: MeanderFilterGroupInput | null | undefined;
  readonly first?: number | undefined;
  readonly sort?: MeanderSortInput | null | undefined;
}

/** A shape column a sort may name. */
export type ShapeSortField = (typeof SHAPE_SORT_FIELDS)[number];

/** What a sort orders by. */
export type SortTarget =
  | { readonly characteristicId: number; readonly kind: "characteristic" }
  | { readonly column: ShapeSortField; readonly kind: "shape" }
  | { readonly kind: "id" };

/** A sort value as a cursor carries it. */
export type SortValue = boolean | number | string;
