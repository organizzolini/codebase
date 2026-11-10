import { Field, InputType, ObjectType } from "@nestjs/graphql";

import { EventFilterCombinator } from "./event-filter-combinator.entities";
import { EventFilterRuleEntity } from "./event-filter-rule.entities";

// 🧬 Entities

/**
 * Conditions and nested groups joined under one combinator.
 */
@InputType("EventFilterGroupInput")
@ObjectType("EventFilterGroup")
export class EventFilterGroupEntity {
  @Field(() => EventFilterCombinator)
  combinator!: EventFilterCombinator;

  @Field(() => [EventFilterGroupEntity], {
    description: "The groups nested in this one.",
    nullable: true,
  })
  groups?: EventFilterGroupEntity[] | null;

  @Field(() => [EventFilterRuleEntity], {
    description: "The conditions of this group.",
    nullable: true,
  })
  rules?: EventFilterRuleEntity[] | null;
}
