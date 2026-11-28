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

  @Field(() => Boolean, {
    description:
      "Whether the root is one of the defaults events group by when no level is picked.",
  })
  isDefaultGroup!: boolean;

  @Field(() => Boolean, {
    description: "Whether the Filter menu offers the root as a value.",
  })
  isFilterable!: boolean;

  @Field(() => Boolean, {
    description: "Whether the Group menu offers the root as a level.",
  })
  isGroupable!: boolean;

  @Field(() => Boolean, {
    description: "Whether the Select menu offers the root as a column.",
  })
  isSelectable!: boolean;

  @Field(() => Boolean, {
    description: "Whether the Sort menu offers the root.",
  })
  isSortable!: boolean;

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
