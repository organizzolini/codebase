import { Field, ID, ObjectType } from "@nestjs/graphql";

import { EventFilterGroupEntity } from "./event-filter.entities";

// 🧬 Entities

/**
 * A named filter the calendar applies in one step, resolved against the tags
 * the data has.
 */
@ObjectType("EventFilterCollection")
export class EventFilterCollectionEntity {
  @Field(() => String, { description: "What the collection keeps." })
  description!: string;

  @Field(() => EventFilterGroupEntity, {
    description:
      "The collection's conditions by the ids of the tags the data has, ready to be sent back as the filter of an events or facets query.",
  })
  filter!: EventFilterGroupEntity;

  @Field(() => ID)
  id!: string;

  @Field(() => String, { description: "The collection's label." })
  name!: string;
}
