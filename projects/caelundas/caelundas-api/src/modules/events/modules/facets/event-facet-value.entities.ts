import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

// 🧬 Entities

/**
 * A tag a facet offers.
 */
@ObjectType("EventFacetValue")
export class EventFacetValueEntity {
  @Field(() => [String], {
    description:
      "The other parents the tag sits under, as paths from the root, when it has several; empty for a tag with one. Each parent lists the tag as a value of its own, with this id.",
  })
  alsoUnder!: string[];

  @Field(() => Int, {
    description:
      "The events that carry the tag or any tag beneath it, among those that overlap the period, or all of them with none.",
  })
  count!: number;

  @Field(() => Int, {
    description:
      "How far beneath its root the tag sits by this path, so a root's children are 1.",
  })
  depth!: number;

  @Field(() => String, {
    description: "The slug of a lucide icon for the tag, if it has one.",
    nullable: true,
  })
  icon!: null | string;

  @Field(() => ID)
  id!: string;

  @Field(() => Boolean, {
    description:
      "Whether the tag is one of the defaults events group by when no level is picked.",
  })
  isDefaultGroup!: boolean;

  @Field(() => Boolean, {
    description:
      "Whether the Filter menu offers the tag as a value; a filter on it still works when false.",
  })
  isFilterable!: boolean;

  @Field(() => Boolean, {
    description:
      "Whether the Group menu offers the tag as a level; a grouping by it still works when false.",
  })
  isGroupable!: boolean;

  @Field(() => Boolean, {
    description:
      "Whether the Select menu offers the tag as a column; a selection of it still works when false.",
  })
  isSelectable!: boolean;

  @Field(() => Boolean, {
    description:
      "Whether the Sort menu offers the tag; a sort by it still works when false.",
  })
  isSortable!: boolean;

  @Field(() => String, { description: "The tag's own label." })
  name!: string;

  @Field(() => String, {
    description: "What the tag means, if it says.",
    nullable: true,
  })
  note!: null | string;

  @Field(() => String, {
    description:
      "The names from beneath the root down to this tag by one of its paths, joined by ' / '; a tag with several parents is listed once a path.",
  })
  path!: string;

  @Field(() => String, {
    description: "The tag's name as a slug, unique among its siblings.",
  })
  slug!: string;
}
