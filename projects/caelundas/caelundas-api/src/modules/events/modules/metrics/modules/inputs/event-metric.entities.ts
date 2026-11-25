import { registerEnumType } from "@nestjs/graphql";

// 🧬 Entities

/** A number computed over the events of a group. */
export enum EventMetric {
  AVERAGE_DURATION_MINUTES = "AVERAGE_DURATION_MINUTES",
  COVERED_MINUTES = "COVERED_MINUTES",
  COVERED_PERCENT = "COVERED_PERCENT",
  DAYS_WITH_EVENTS = "DAYS_WITH_EVENTS",
  EVENTS = "EVENTS",
  FIRST_START = "FIRST_START",
  INSTANTS = "INSTANTS",
  LAST_START = "LAST_START",
  LONGEST_DURATION_MINUTES = "LONGEST_DURATION_MINUTES",
  MEDIAN_DURATION_MINUTES = "MEDIAN_DURATION_MINUTES",
  PROGRESSIVE_COVERED_PERCENT = "PROGRESSIVE_COVERED_PERCENT",
  PROGRESSIVE_HOURS = "PROGRESSIVE_HOURS",
  PROGRESSIVE_TOTAL_PERCENT = "PROGRESSIVE_TOTAL_PERCENT",
  SHORTEST_DURATION_MINUTES = "SHORTEST_DURATION_MINUTES",
  SPANS = "SPANS",
  TOTAL_DURATION_MINUTES = "TOTAL_DURATION_MINUTES",
  TOTAL_TIME_PERCENT = "TOTAL_TIME_PERCENT",
  UNIQUE_NAMES = "UNIQUE_NAMES",
  UNIQUE_TAGS = "UNIQUE_TAGS",
}

registerEnumType(EventMetric, {
  description:
    "A number computed in SQL over the distinct events of a group. Durations are in minutes and cover spans only, except the total; a start is epoch milliseconds. Percents are of the period's length, clipped to it: COVERED_ counts overlaps once (0 to 100), TOTAL_TIME_ counts them per event (may pass 100), and PROGRESSIVE_ reads only progressive events.",
  name: "EventMetric",
});
