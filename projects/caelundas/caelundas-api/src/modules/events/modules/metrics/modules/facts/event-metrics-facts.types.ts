import type { EventMetricsRow } from "../../event-metrics.types";
import type { factsRowSchema } from "./event-metrics-facts.constants";
import type { z } from "zod";

// 🏷️ Types

/** The statement that measures every level at once, and what it selects. */
export interface CompiledFactsQuery {
  /** Whether it also measures the child tags of the last level's tags. */
  children: boolean;
  /** How many grouping levels it measures; the total is not one. */
  levels: number;
  parameters: unknown[];
  sql: string;
}

/** A level's source of keys: a calendar field or picked tags. */
export interface FactsLevel {
  /** SQL listing the keys an event `e` falls under. */
  keys: string;
  /** The tags the level picks. */
  picked: readonly string[];
}

/** One row of the facts statement. */
export type FactsRow = z.infer<typeof factsRowSchema>;

/** The rows of each level, and of the whole set. */
export interface MeasuredRows {
  /** The child groups of the groups that have none at a next level. */
  children: EventMetricsRow[];
  levels: EventMetricsRow[][];
  total: EventMetricsRow[];
}
