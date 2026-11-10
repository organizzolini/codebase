import { Field, Float, ObjectType } from "@nestjs/graphql";

import { PeriodEntity } from "./period.entities";

// 🧬 Entities

/**
 * The days a view shows around a day, and the period of events to read for
 * them.
 */
@ObjectType("Windows")
export class WindowsEntity {
  @Field(() => Float, {
    description:
      "How long one column of the timeline's axis lasts at its scale, in minutes: 15 for a day, a day for a week or a month, a week for a quarter, an average month for a year. Null for a view other than the timeline.",
    nullable: true,
  })
  columnMinutes!: null | number;

  @Field(() => PeriodEntity, {
    description:
      "The period to read events for: the visible days and a day either side, so every event the observer's zone shows is held.",
  })
  read!: PeriodEntity;

  @Field(() => PeriodEntity, {
    description:
      "The days the view shows, from UTC midnight to UTC midnight, the day a zone's midnight falls on being within a day of it.",
  })
  visible!: PeriodEntity;
}
