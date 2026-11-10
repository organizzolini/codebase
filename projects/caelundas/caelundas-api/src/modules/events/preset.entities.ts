import { Field, ID, ObjectType } from "@nestjs/graphql";

import { EventFilterGroupEntity } from "./event-filter.entities";

// 🧬 Entities

/**
 * A named filter the calendar applies in one step, resolved against the tags
 * the data has.
 */
@ObjectType("Preset")
export class PresetEntity {
  @Field(() => String, { description: "What the preset keeps." })
  description!: string;

  @Field(() => EventFilterGroupEntity, {
    description:
      "The preset's conditions by the ids of the tags the data has, ready to be sent back as the filter of an events or facets query.",
  })
  filter!: EventFilterGroupEntity;

  @Field(() => ID)
  id!: string;

  @Field(() => String, { description: "The preset's label." })
  name!: string;
}
