import { DURATION_BUCKETS } from "../../../calendar-filters/components/event-filter-model/event-filters.constants";

export const PATH_SEPARATOR = " / ";

/**
 * Where events with no value at a level sort: last.
 */
export const NO_GROUP_RANK = "￿";

/**
 * A duration bucket's group rank, by its key.
 */
export const DURATION_RANKS: ReadonlyMap<string, string> = new Map(
  DURATION_BUCKETS.map((bucket, index) => [
    bucket.value,
    String(index).padStart(2, "0"),
  ]),
);

/**
 * What a sort's direction multiplies a comparison by.
 */
export const SORT_SIGNS = { asc: 1, desc: -1 } as const;
