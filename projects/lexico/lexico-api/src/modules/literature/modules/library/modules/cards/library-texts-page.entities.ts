import { Field, Int, ObjectType } from "@nestjs/graphql";

import { LibraryTextType } from "./library-text.entities";

/** One page of Texts under an author or a Text. */
@ObjectType("LibraryTextsPage")
export class LibraryTextsPageType {
  @Field(() => Int)
  public pageCount!: number;

  @Field(() => [LibraryTextType])
  public texts!: LibraryTextType[];

  @Field(() => Int)
  public totalCount!: number;
}
