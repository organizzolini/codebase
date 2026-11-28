import { DURATION_BUCKETS } from "../../../filtering/modules/query-building/event-filter-fields.constants";

// ♟️ Constants

/** Separates the names of a tag's rank. */
export const RANK_SEPARATOR = " / ";

/** A duration bucket's rank: its place among the buckets. */
export const DURATION_RANKS: ReadonlyMap<string, string> = new Map(
  DURATION_BUCKETS.map((bucket, index) => [
    bucket.value,
    String(index).padStart(2, "0"),
  ]),
);
