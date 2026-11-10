import type {
  EventFilterGroupInput,
  EventGroupingInput,
} from "../../graphql/generated/operations";
import type { Period } from "./calendar-records.types";

// 🏷️ Types

/**
 * What a read of the events asks for: a period, and optionally the filter
 * the events in it must meet and the grouping each is read with keys for.
 */
export interface EventsReadQuery {
  filter?: EventFilterGroupInput | null | undefined;
  grouping?: EventGroupingInput | null | undefined;
  period: Period;
}
