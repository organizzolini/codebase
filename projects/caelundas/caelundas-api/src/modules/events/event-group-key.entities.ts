import { Field, ObjectType } from "@nestjs/graphql";

// 🧬 Entities

/**
 * One group an event falls in at one level of a grouping: a tag, with its
 * name and full path, or a value derived from the event's times.
 */
@ObjectType("EventGroupKey")
export class EventGroupKeyEntity {
  @Field(() => String, {
    description:
      "Identifies the group within its level: a tag's id, or the derived value as text, such as 2026, 2026-Q1, 2026-03, the Sunday a week starts on as YYYY-MM-DD, a day as YYYY-MM-DD, a weekday number from Sunday as 0, an hour as 00 to 23, or a duration bucket name.",
  })
  key!: string;

  @Field(() => String, {
    description: "A tag's own name; null for a derived value.",
    nullable: true,
  })
  label!: null | string;

  @Field(() => String, {
    description:
      "A tag's names from its root down, joined by ' / '; null for a derived value.",
    nullable: true,
  })
  path!: null | string;
}
