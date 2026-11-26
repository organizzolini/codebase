import type { EventScope } from "./modules/filtering/event-filter.types";
import type { EventGroupLevel } from "./modules/grouping/event-grouping.types";

// 🏷️ Types

/** What an events read adds to its period and filter. */
export interface EventsReadOptions {
  /** The levels to read each event's group keys for. */
  grouping?: readonly EventGroupLevel[];
  /** Which kinds of event to read. */
  scope?: EventScope;
}
