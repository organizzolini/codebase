import { Field, ObjectType } from "@nestjs/graphql";

import { EventMeasureEntity } from "./event-measure.entities";
import { EventMetricEntity } from "./event-metric.entities";

// 🧬 Entities

/**
 * The measures and the metrics a query may name.
 */
@ObjectType("EventMetricCatalog")
export class EventMetricCatalogEntity {
  @Field(() => [EventMeasureEntity], {
    description: "Every measure, by slug.",
  })
  measures!: EventMeasureEntity[];

  @Field(() => [EventMetricEntity], {
    description: "Every metric, in the picker's order.",
  })
  metrics!: EventMetricEntity[];
}
