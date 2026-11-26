import { registerEnumType } from "@nestjs/graphql";

// 🧬 Entities

/** What a measure or a metric is measured in. */
export enum EventMetricUnit {
  COUNT = "count",
  DURATION = "duration",
  INSTANT = "instant",
  NONE = "none",
}

registerEnumType(EventMetricUnit, {
  description:
    "What a value is measured in: a COUNT of events, a DURATION in minutes, an INSTANT in epoch milliseconds, or NONE, a ratio such as a percent from 0 to 100.",
  name: "EventMetricUnit",
});
