import { Field, Float, ObjectType } from "@nestjs/graphql";

import { TimeWindowEntity } from "./time-window.entities";

// 🧬 Entities

/**
 * The days a view shows around a day, and the window of events to read for
 * them.
 */
@ObjectType("CalendarWindows")
export class CalendarWindowsEntity {
  @Field(() => Float, {
    description:
      "How long one column of the timeline's axis lasts at its scale, in minutes: 15 for a day, a day for a week or a month, a week for a quarter, an average month for a year. Null for a view other than the timeline.",
    nullable: true,
  })
  columnMinutes!: null | number;

  @Field(() => TimeWindowEntity, {
    description:
      "The days the view shows, from UTC midnight to UTC midnight, the day a zone's midnight falls on being within a day of it.",
  })
  visible!: TimeWindowEntity;

  @Field(() => TimeWindowEntity, {
    description:
      "The window to read events for: the visible days and a day either side, so every event the observer's zone shows is held.",
  })
  window!: TimeWindowEntity;
}
