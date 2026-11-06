import type {
  EventFilterGroupInput,
  EventGroupingInput,
} from "../../graphql/generated/operations";
import type { EventsWindow } from "./events-database.types";

// 🏷️ Types

/**
 * What a read of the events asks for: a window, and optionally the filter
 * the events in it must meet and the grouping each is read with keys for.
 */
export interface EventsReadQuery {
  filter?: EventFilterGroupInput | null | undefined;
  grouping?: EventGroupingInput | null | undefined;
  window: EventsWindow;
}
