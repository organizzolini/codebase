import { Field, ObjectType } from "@nestjs/graphql";

import { EventMetricUnit } from "./event-metric-unit.entities";

// 🧬 Entities

/**
 * A thing measured about a group of events.
 */
@ObjectType("EventMeasure")
export class EventMeasureEntity {
  @Field(() => String, { description: "Its lucide icon slug." })
  icon!: string;

  @Field(() => String, { description: "What it is called." })
  name!: string;

  @Field(() => String, { description: "What it measures, in a sentence." })
  note!: string;

  @Field(() => String, {
    description: "Its name as a URL slug, which names it everywhere.",
  })
  slug!: string;

  @Field(() => EventMetricUnit, { description: "What it is measured in." })
  unit!: EventMetricUnit;
}
