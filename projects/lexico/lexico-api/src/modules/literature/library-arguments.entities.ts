import { ArgsType as ArgumentsType, Field, Int } from "@nestjs/graphql";

/** Arguments for one page of the library, with an optional search. */
@ArgumentsType()
export class LibraryArguments {
  @Field(() => Int, {
    description: "The 1-based page to return. Defaults to 1.",
    nullable: true,
  })
  public page?: null | number;

  @Field(() => Int, {
    description: "Authors per page. Defaults to 24, at most 100.",
    nullable: true,
  })
  public pageSize?: null | number;

  @Field(() => String, {
    description:
      "Matches every searchable attribute of authors and texts. Blank means no search.",
    nullable: true,
  })
  public search?: null | string;
}
