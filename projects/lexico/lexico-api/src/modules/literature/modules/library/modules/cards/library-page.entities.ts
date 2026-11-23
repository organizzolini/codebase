import { Field, Int, ObjectType } from "@nestjs/graphql";

import { LibraryAuthorType } from "./library-author.entities";

/** One page of library author cards. */
@ObjectType("LibraryPage")
export class LibraryPageType {
  @Field(() => [LibraryAuthorType])
  public authors!: LibraryAuthorType[];

  @Field(() => Int)
  public pageCount!: number;

  @Field(() => Int)
  public totalCount!: number;
}
