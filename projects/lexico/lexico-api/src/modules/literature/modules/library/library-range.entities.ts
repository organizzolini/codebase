import { Field, InputType, Int } from "@nestjs/graphql";

/** An inclusive range. A missing bound leaves that side open. */
@InputType("LibraryRange")
export class LibraryRangeInput {
  @Field(() => Int, {
    description: "The highest value kept, inclusive.",
    nullable: true,
  })
  public max?: null | number;

  @Field(() => Int, {
    description: "The lowest value kept, inclusive.",
    nullable: true,
  })
  public min?: null | number;
}
