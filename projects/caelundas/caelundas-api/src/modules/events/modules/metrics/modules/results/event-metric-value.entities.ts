import { Field, Float, ObjectType } from "@nestjs/graphql";

// 🧬 Entities

/**
 * One metric's value, and what it was in the previous period.
 */
@ObjectType("EventMetricValue")
export class EventMetricValueEntity {
  @Field(() => String, { description: "The slug of the metric this is." })
  metric!: string;

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
