import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

import { EventMetricValueEntity } from "./event-metric-value.entities";

// 🧬 Entities

/**
 * One group of the metrics tree, with its subgroups beneath it.
 */
@ObjectType("EventMetricGroup")
export class EventMetricGroupEntity {
  @Field(() => [EventMetricGroupEntity], {
    description:
      "The subgroups at the next level, in the order of their keys, up to 500.",
  })
  children!: EventMetricGroupEntity[];

  @Field(() => ID, {
    description:
      "Identifies the group in the whole tree, as the table's group id does: its parent's id, then the level and key.",
  })
  id!: string;

  @Field(() => String, {
    description:
      "Identifies the group within its level as an event's group key does; null for the group of events with no key.",
    nullable: true,
  })
  key!: null | string;

  @Field(() => String, {
    description:
      "A tag's name, a derived value as text, or No followed by the field for the group with no key.",
  })
  label!: string;

  @Field(() => Int, {
    description: "The index of the grouping level the group is at.",
  })
  level!: number;

  @Field(() => String, {
    description: "A tag's names from its root down, joined by ' / '.",
    nullable: true,
  })
  path!: null | string;

  @Field(() => String, {
    description:
      "What sorts the group among its siblings; null for the group with no key.",
    nullable: true,
  })
  rank!: null | string;

  @Field(() => [EventMetricValueEntity], {
    description: "The metrics asked for, in the order asked.",
  })
  values!: EventMetricValueEntity[];
}
