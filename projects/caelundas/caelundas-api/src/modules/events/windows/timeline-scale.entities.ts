import { registerEnumType } from "@nestjs/graphql";

// 🧬 Entities

/** The span the timeline shows at once, finest to coarsest. */
export enum TimelineScale {
  DAY = "day",
  MONTH = "month",
  QUARTER = "quarter",
  WEEK = "week",
  YEAR = "year",
}

registerEnumType(TimelineScale, {
  description:
    "The span the timeline shows at once: a day in fifteen-minute columns, a week or a month in days, a quarter in weeks, a year in months.",
  name: "TimelineScale",
});
