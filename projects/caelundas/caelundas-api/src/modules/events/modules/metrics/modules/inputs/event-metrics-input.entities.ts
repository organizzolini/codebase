import { Field, ID, InputType } from "@nestjs/graphql";

import { EventFilterGroupEntity } from "../../../filtering/modules/rules/event-filter.entities";
import { EventGroupLevelEntity } from "../../../grouping/event-group-level.entities";
import { PeriodInput } from "../../../windows/period-input.entities";

import { EventMetric } from "./event-metric.entities";

// 📥 Inputs

/**
 * What to measure: the events in a period meeting a filter, grouped, and the
 * metrics to compute for each group.
 */
@InputType("EventMetricsInput")
export class EventMetricsInputEntity {
  @Field(() => Boolean, {
    defaultValue: false,
    description:
      "Also computes every metric over the period of equal length right before this one, to set as each value's previous.",
    nullable: true,
  })
  compareToPrevious?: boolean | null;

  @Field(() => EventFilterGroupEntity, {
    description: "Keeps only the events that meet this nested AND/OR filter.",
    nullable: true,
  })
  filter?: EventFilterGroupEntity | null;

  @Field(() => [EventGroupLevelEntity], {
    description:
      "The levels to group by, outermost first, as the events query reads them; each group holds its subgroups, one per level.",
    nullable: true,
  })
  grouping?: EventGroupLevelEntity[] | null;

  @Field(() => [EventMetric], {
    description: "The metrics to compute for the whole set and each group.",
  })
  metrics!: EventMetric[];

  @Field(() => PeriodInput, {
    description: "The events that overlap this period are measured.",
  })
  period!: PeriodInput;

  @Field(() => ID, {
    description:
      "Restricts UNIQUE_TAGS to the tags beneath this tag, which itself is not counted.",
    nullable: true,
  })
  tagRoot?: null | string;
}
