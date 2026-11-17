import { ArgsType as ArgumentsType, Field, ID, Int } from "@nestjs/graphql";

/** Arguments for one page of the Texts under a Text. */
@ArgumentsType()
export class LibraryChildrenArguments {
  @Field(() => Int, {
    description: "The 1-based page to return. Defaults to 1.",
    nullable: true,
  })
  public page?: null | number;

  @Field(() => Int, {
    description: "Texts per page. Defaults to 100, at most 100.",
    nullable: true,
  })
  public pageSize?: null | number;

  @Field(() => ID)
  public parentTextId!: string;

  @Field(() => String, {
    description: "Marks matches in the children; never narrows them.",
    nullable: true,
  })
  public search?: null | string;
}
