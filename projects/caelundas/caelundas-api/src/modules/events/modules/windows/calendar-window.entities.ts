import { registerEnumType } from "@nestjs/graphql";

// 🧬 Entities

/**
 * A view the calendar offers.
 */
export enum CalendarWindow {
  AGENDA = "agenda",
  DAY = "day",
  MONTH = "month",
  THREE_DAY = "three-day",
  TIMELINE = "timeline",
  WEEK = "week",
}

registerEnumType(CalendarWindow, {
  description: "A view the calendar offers.",
  name: "CalendarWindow",
});
