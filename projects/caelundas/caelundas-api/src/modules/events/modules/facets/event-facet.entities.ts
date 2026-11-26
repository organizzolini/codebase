import { Field, ID, ObjectType } from "@nestjs/graphql";

import { EventFacetValueEntity } from "./event-facet-value.entities";

// 🧬 Entities

/**
 * One tag root, the dimension it names, and every tag beneath it, so the
 * filters can offer a field per root without knowing the roots ahead.
 */
@ObjectType("EventFacet")
export class EventFacetEntity {
  @Field(() => String, {
    description: "The slug of a lucide icon for the root, if it has one.",
    nullable: true,
  })
  icon!: null | string;

  @Field(() => ID)
  id!: string;

  @Field(() => String, { description: "The root tag's label." })
  name!: string;

  @Field(() => String, {
    description: "What the root means, if it says.",
    nullable: true,
  })
  note!: null | string;

  @Field(() => String, {
    description: "The root tag's name as a slug, unique among the roots.",
  })
  slug!: string;

  @Field(() => [EventFacetValueEntity], {
    description: "The tags beneath the root, depth first.",
  })
  values!: EventFacetValueEntity[];
}
