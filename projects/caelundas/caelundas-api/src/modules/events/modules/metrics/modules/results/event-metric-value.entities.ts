import { Field, Float, ObjectType } from "@nestjs/graphql";

import { EventMetric } from "../inputs/event-metric.entities";

// 🧬 Entities

/**
 * One metric's value, and what it was in the previous period.
 */
@ObjectType("EventMetricValue")
export class EventMetricValueEntity {
  @Field(() => EventMetric, { description: "Which metric this is." })
  metric!: EventMetric;

  @Field(() => Float, {
    description:
      "Its value over the previous period; null unless compareToPrevious is set.",
    nullable: true,
  })
  previous!: null | number;

  @Field(() => Float, {
    description:
      "Its value over the period; null when undefined, such as the median of nothing.",
    nullable: true,
  })
  value!: null | number;
}
