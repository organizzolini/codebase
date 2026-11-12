import { Field, InputType, Int } from "@nestjs/graphql";

// 📥 Inputs

/**
 * One level of a grouping: the field it groups by and, for a tag root, the
 * tags it makes a group of, each holding the events under it.
 */
@InputType("EventGroupLevelInput")
export class EventGroupLevelEntity {
  @Field(() => Int, {
    description:
      "For a tag root with no tags picked, how many levels beneath the root to group by: 1 for the root's children. A tag that ends above the depth stands for itself. Defaults to 1.",
    nullable: true,
  })
  depth?: null | number;

  @Field(() => String, {
    description:
      "What to group by: tag:<root tag id> for a tag root, or year, quarter, month, week, day, weekday, hour or duration, derived from each event's start or duration in the zone it was observed in.",
  })
  field!: string;

  @Field(() => [String], {
    description:
      "For a tag root, the ids of the tags to make a group of each, in place of the root's children or a depth.",
    nullable: true,
  })
  tags?: null | string[];
}
