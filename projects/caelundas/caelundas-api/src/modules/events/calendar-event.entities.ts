import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

import { CalendarEventTagEntity } from "./calendar-event-tag.entities";

// 🧬 Entities

/**
 * One astronomical event as the calendar shows it. `start` and `end` are
 * equal for an instant.
 */
@ObjectType("CalendarEvent")
export class CalendarEventEntity {
  @Field(() => String, {
    description: "The event's color, when it has one.",
    nullable: true,
  })
  color!: null | string;

  @Field(() => String, { description: "What the event is, in full." })
  description!: string;

  @Field(() => Int, {
    description: "Whole minutes from start to end, 0 for an instant.",
  })
  durationMinutes!: number;

  @Field(() => Date, { description: "When the event ends, as an instant." })
  end!: Date;

  @Field(() => ID)
  id!: string;

  @Field(() => String, {
    description: "Where the event is observed from, when it says.",
    nullable: true,
  })
  location!: null | string;

  @Field(() => Date, { description: "When the event starts, as an instant." })
  start!: Date;

  @Field(() => String, {
    description:
      "The calendar day the event starts on in its own zone, as YYYY-MM-DD.",
  })
  startLocalDay!: string;

  @Field(() => Int, {
    description: "The hour from 0 to 23 the event starts in in its own zone.",
  })
  startLocalHour!: number;

  @Field(() => String, { description: "A short title for the event." })
  summary!: string;

  @Field(() => [CalendarEventTagEntity], {
    description: "The tags the event was given, in path order.",
  })
  tags!: CalendarEventTagEntity[];

  @Field(() => String, {
    description: "The observer's IANA time zone.",
  })
  timezone!: string;
}
