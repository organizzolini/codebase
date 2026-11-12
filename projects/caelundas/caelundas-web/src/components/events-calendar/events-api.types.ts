import type {
  EventFilterGroupInput,
  EventGroupingInput,
} from "../../graphql/generated/operations";
import type { Period } from "./calendar-records.types";

// 🏷️ Types

/**
 * Events read: a period, plus an optional filter and grouping.
 */
export interface EventsReadQuery {
  filter?: EventFilterGroupInput | null | undefined;
  grouping?: EventGroupingInput | null | undefined;
  period: Period;
}
