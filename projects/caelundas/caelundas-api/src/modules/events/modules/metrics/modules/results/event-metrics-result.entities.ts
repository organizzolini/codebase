import { Field, ObjectType } from "@nestjs/graphql";

import { EventMetricGroupEntity } from "./event-metric-group.entities";
import { EventMetricValueEntity } from "./event-metric-value.entities";

// 🧬 Entities

/**
 * The metrics over every matching event and over each group.
 */
@ObjectType("EventMetricsResult")
export class EventMetricsResultEntity {
  @Field(() => [EventMetricGroupEntity], {
    description:
      "The top-level groups with their subgroups nested through every level; a group present only in the previous period comes back with empty values and its previous set.",
  })
  groups!: EventMetricGroupEntity[];

  @Field(() => String, {
    description: "The zone the dataset's events were computed in.",
  })
  timezone!: string;

  @Field(() => [EventMetricValueEntity], {
    description: "The metrics over the whole filtered set.",
  })
  total!: EventMetricValueEntity[];
}
