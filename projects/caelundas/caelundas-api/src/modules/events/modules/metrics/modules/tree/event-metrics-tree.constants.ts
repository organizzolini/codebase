import { DURATION_BUCKETS } from "../../../filtering/modules/query-building/event-filter-fields.constants";

// ♟️ Constants

/** Separates the names of a tag's ordering key. */
export const ORDER_SEPARATOR = " / ";

/** A duration bucket's order: its place among the buckets. */
export const DURATION_ORDERS: ReadonlyMap<string, string> = new Map(
  DURATION_BUCKETS.map((bucket, index) => [
    bucket.value,
    String(index).padStart(2, "0"),
  ]),
);
