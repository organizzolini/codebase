import { Field, InputType } from "@nestjs/graphql";

import { EventGroupLevelEntity } from "./event-group-level.entities";

// 📥 Inputs

/**
 * The levels to read each event's group keys for, and the one more level the
 * events are colored by.
 */
@InputType("EventGroupingInput")
export class EventGroupingEntity {
  @Field(() => EventGroupLevelEntity, {
    description:
      "One more level, read like a grouping level and returned after them, for the field the events are colored by; it does not count toward the three levels.",
    nullable: true,
  })
  colorBy?: EventGroupLevelEntity | null;

  @Field(() => [EventGroupLevelEntity], {
    description:
      "Up to three levels, outermost first, by tag root or by year, quarter, month, week, day, weekday, hour or duration.",
    nullable: true,
  })
  levels?: EventGroupLevelEntity[] | null;
}
