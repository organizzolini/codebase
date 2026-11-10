import { ArgsType as ArgumentsType, Field, Int } from "@nestjs/graphql";

import { CalendarWindow } from "./calendar-window.entities";
import { TimelineScale } from "./timeline-scale.entities";

// ⚙️ Args

/**
 * What decides the days a view shows around the day it opens on.
 */
@ArgumentsType()
export class WindowsArguments {
  @Field(() => Int, {
    description:
      "How many days the agenda lists from the anchor's day, from 1 to 366; 30 by default. Read for the agenda, or for no view.",
    nullable: true,
  })
  agendaDays?: null | number;

  @Field(() => Date, {
    description:
      "An instant on the day the view opens on, read as its UTC day; noon UTC falls on that same day in every zone from UTC-11 to UTC+11.",
  })
  anchor!: Date | string;

  @Field(() => TimelineScale, {
    description: "The span the timeline shows; month by default.",
    nullable: true,
  })
  scale?: null | TimelineScale;

  @Field(() => CalendarWindow, {
    description:
      "The calendar window. With none, the windows hold the month and agenda views both, so a resize needs no reload.",
    nullable: true,
  })
  window?: CalendarWindow | null;
}
