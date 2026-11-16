import { Field, ObjectType } from "@nestjs/graphql";

import { LibraryMatchType } from "./library-match.entities";
import { TextType } from "./text.entities";

/** A Text on an author card, with the spans its search matched. */
@ObjectType("LibraryText")
export class LibraryTextType {
  @Field(() => [LibraryMatchType])
  public matches!: LibraryMatchType[];

  @Field(() => TextType, {
    description: "The Text. Its parentText is the book it belongs to, if any.",
  })
  public text!: TextType;
}
