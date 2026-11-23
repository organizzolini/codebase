import { Field, Int, ObjectType } from "@nestjs/graphql";

import { AuthorType } from "../../../authors/author.entities";

import { LibraryMatchType } from "./library-match.entities";
import { LibraryTextType } from "./library-text.entities";

/** An author card: the author, what matched, and its top-level works. */
@ObjectType("LibraryAuthor")
export class LibraryAuthorType {
  @Field(() => AuthorType)
  public author!: AuthorType;

  @Field(() => [LibraryMatchType])
  public matches!: LibraryMatchType[];

  @Field(() => Int, {
    description: "Every top-level work in scope, even when works omits some.",
  })
  public workCount!: number;

  @Field(() => [LibraryTextType], {
    description:
      "The card's top-level works in scope, at most 50. A work whose child matches is in scope.",
  })
  public works!: LibraryTextType[];
}
