import { Field, Int, ObjectType } from "@nestjs/graphql";

import { TextType } from "../texts/text.entities";

import { LibraryMatchType } from "./library-match.entities";

/** A Text on an author card, with the spans its search matched. */
@ObjectType("LibraryText")
export class LibraryTextType {
  @Field(() => Int, {
    description: "The Texts directly under this one, whatever the search.",
  })
  public childCount!: number;

  @Field(() => [LibraryMatchType])
  public matches!: LibraryMatchType[];

  @Field(() => TextType, {
    description: "The Text. Its parentText is the book it belongs to, if any.",
  })
  public text!: TextType;
}
