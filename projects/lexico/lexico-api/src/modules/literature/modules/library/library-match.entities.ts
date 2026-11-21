import { Field, Int, ObjectType } from "@nestjs/graphql";

/** One matched span of a field, as offsets into the field's value. */
@ObjectType("LibraryMatch")
export class LibraryMatchType {
  @Field(() => Int, { description: "Offset just past the match." })
  public end!: number;

  @Field({ description: "The field the match is in, such as `name`." })
  public field!: string;

  @Field(() => Int, { description: "Offset of the first character matched." })
  public start!: number;
}
