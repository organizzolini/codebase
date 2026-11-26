import { Field, ObjectType } from "@nestjs/graphql";

import { EventMetricUnit } from "./event-metric-unit.entities";

// 🧬 Entities

/**
 * A number the interface shows for a group of events.
 */
@ObjectType("EventMetric")
export class EventMetricEntity {
  @Field(() => Boolean, {
    description:
      "Whether a group's value is the sum of its subgroups': its expression is one measure that sums.",
  })
  additive!: boolean;

  @Field(() => String, { description: "Its lucide icon slug." })
  icon!: string;

  @Field(() => [String], {
    description:
      "The slugs of the measures it reads, through any metric it reads.",
  })
  measures!: string[];

  @Field(() => String, { description: "What it is called." })
  name!: string;

  @Field(() => String, { description: "What it shows, in a sentence." })
  note!: string;

  @Field(() => String, {
    description: "Its name as a URL slug, which names it in a query.",
  })
  slug!: string;

  @Field(() => EventMetricUnit, { description: "What it is measured in." })
  unit!: EventMetricUnit;
}
