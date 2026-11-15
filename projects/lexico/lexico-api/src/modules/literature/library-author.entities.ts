import { Field, Int, ObjectType } from "@nestjs/graphql";

import { AuthorType } from "./author.entities";
import { LibraryMatchType } from "./library-match.entities";
import { LibraryTextType } from "./library-text.entities";

/** An author card: the author, what matched, and the Texts it carries. */
@ObjectType("LibraryAuthor")
export class LibraryAuthorType {
  @Field(() => AuthorType)
  public author!: AuthorType;

  @Field(() => [LibraryMatchType])
  public matches!: LibraryMatchType[];

  @Field(() => Int, {
    description: "Every Text the card matches, even when texts omits some.",
  })
  public textCount!: number;

  @Field(() => [LibraryTextType], {
    description: "The card's matching Texts, at most 50, in title order.",
  })
  public texts!: LibraryTextType[];
}
