import { Field, ID, ObjectType } from "@nestjs/graphql";

import { EventFacetValueEntity } from "./event-facet-value.entities";

// 🧬 Entities

/**
 * One tag root, the dimension it names, and every tag beneath it, so the
 * filters can offer a field per root without knowing the roots ahead.
 */
@ObjectType("EventFacet")
export class EventFacetEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { description: "The root tag's label." })
  name!: string;

  @Field(() => [EventFacetValueEntity], {
    description: "The tags beneath the root, depth first.",
  })
  values!: EventFacetValueEntity[];
}
