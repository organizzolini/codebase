import type { FactsGrain } from "../../event-metrics.types";

// 🏷️ Types

/** A calendar field's rollup column and the key SQL it makes. */
export interface RollupCalendarKey {
  column: string;
  key: string;
}

/** A side statement of metrics that read more than the totals. */
export type RollupFamily = "directs" | "durations" | "names";

/** What a rollup statement groups by and reads. */
export interface RollupTarget {
  columns: string;
  crossingExtra: string;
  crossingJoin: string;
  /** The grain of `calendar_event_facts` the groups are read from. */
  grain: FactsGrain;
  /** The rollup column the groups are of, or none for the whole set. */
  group: null | string;
  join: string;
  names: string;
  restrict: string;
  rollupExtra: string;
  /** The tag whose children are the groups, when a tag level. */
  root: null | string;
  /** The statement of the events that are in no group, or none. */
  untagged: string;
  /** Those events as rows of the groups' shape, or none. */
  untaggedRows: string;
}
