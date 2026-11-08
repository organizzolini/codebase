import { registerEnumType } from "@nestjs/graphql";

// 🧬 Entities

/**
 * A view the calendar offers.
 */
export enum CalendarView {
  AGENDA = "agenda",
  DAY = "day",
  MONTH = "month",
  THREE_DAY = "three-day",
  TIMELINE = "timeline",
  WEEK = "week",
}

registerEnumType(CalendarView, {
  description: "A view the calendar offers.",
  name: "CalendarView",
});
