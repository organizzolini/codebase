import { Field, Int, ObjectType } from "@nestjs/graphql";

/** One value a library filter may take, with how many inscriptions carry it. */
@ObjectType("LibraryFacetValue")
export class LibraryFacetValueType {
  @Field(() => Int, { description: "How many Texts carry this value." })
  public count!: number;

  @Field(() => String, { description: "The stored value." })
  public value!: string;
}
