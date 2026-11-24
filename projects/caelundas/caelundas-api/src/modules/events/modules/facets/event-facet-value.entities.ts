import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

// 🧬 Entities

/**
 * A tag a facet offers.
 */
@ObjectType("EventFacetValue")
export class EventFacetValueEntity {
  @Field(() => Int, {
    description:
      "The events that carry the tag or any tag beneath it, among those that overlap the period, or all of them with none.",
  })
  count!: number;

  @Field(() => Int, {
    description:
      "How far beneath its root the tag sits, so a root's children are 1.",
  })
  depth!: number;

  @Field(() => String, {
    description: "The slug of a lucide icon for the tag, if it has one.",
    nullable: true,
  })
  icon!: null | string;

  @Field(() => ID)
  id!: string;

  @Field(() => String, { description: "The tag's own label." })
  name!: string;

  @Field(() => String, {
    description: "What the tag means, if it says.",
    nullable: true,
  })
  note!: null | string;

  @Field(() => String, {
    description:
      "The names from beneath the root down to this tag, joined by ' / '.",
  })
  path!: string;
}
