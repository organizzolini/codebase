import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

// 🧬 Entities

/**
 * A node of the tag tree attached to an event.
 */
@ObjectType("CalendarEventTag")
export class CalendarEventTagEntity {
  @Field(() => Int, {
    description: "How many ancestors the tag has, so a root is 0.",
  })
  depth!: number;

  @Field(() => ID)
  id!: string;

  @Field(() => String, { description: "The tag's own label." })
  name!: string;

  @Field(() => String, {
    description: "Every name from the root down to this tag, joined by ' / '.",
  })
  path!: string;
}
