import type {
  EventFilterGroupInput,
  EventGroupingInput,
} from "../../graphql/generated/operations";
import type { EventsWindow } from "./calendar-records.types";

// 🏷️ Types

/**
 * What an events read asks for: a window, and optionally a filter and a grouping.
 */
export interface EventsReadQuery {
  filter?: EventFilterGroupInput | null | undefined;
  grouping?: EventGroupingInput | null | undefined;
  window: EventsWindow;
}
