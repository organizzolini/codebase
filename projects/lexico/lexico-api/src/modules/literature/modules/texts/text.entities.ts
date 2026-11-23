import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";

import { textCollection } from "@codebase/lexico-db";

import { DeletableType } from "../../../../deletable.entities";
import { AuthorType } from "../authors/author.entities";

import type {
  TextDatabaseOnlyField,
  TextRelationField,
  TextResolvedField,
} from "../../literature.types";
import type { GraphQLObjectOf, Related } from "@codebase/interface";
import type { Text, TextCollection } from "@codebase/lexico-db";

/** The GraphQL members of a text's collection, each naming the stored value. */
export const TEXT_COLLECTION_MEMBERS = {
  CSEL: textCollection.csel,
  EDCS: textCollection.edcs,
  PERSEUS: textCollection.perseus,
  THE_LATIN_LIBRARY: textCollection.theLatinLibrary,
} as const;

registerEnumType(TEXT_COLLECTION_MEMBERS, {
  description: "The source a text was ingested from.",
  name: "TextCollection",
});

/** A literary work, or one part of one, such as a book of a poem. */
@ObjectType("Text")
export class TextType
  extends DeletableType
  implements
    GraphQLObjectOf<
      Text,
      TextType,
      TextDatabaseOnlyField,
      TextRelationField,
      TextResolvedField
    >
{
  @Field(() => AuthorType)
  public author!: Related<AuthorType>;

  @Field(() => TEXT_COLLECTION_MEMBERS, { nullable: true })
  public collection!: null | TextCollection | undefined;

  @Field(() => String, { nullable: true })
  public edition!: null | string | undefined;

  @Field(() => String, { nullable: true })
  public editors!: null | string | undefined;

  @Field(() => Int, {
    description: "The year an inscription is dated to, negative for BCE.",
    nullable: true,
  })
  public endYear!: null | number | undefined;

  @Field(() => String, {
    description: "The find-spot of an inscription.",
    nullable: true,
  })
  public findSpot!: null | string | undefined;

  @Field(() => String, {
    description: "The EDCS type of an inscription.",
    nullable: true,
  })
  public inscriptionType!: null | string | undefined;

  @Field(() => Int, { nullable: true })
  public lineCount!: null | number | undefined;

  @Field(() => String, {
    description: "The material of an inscription.",
    nullable: true,
  })
  public material!: null | string | undefined;

  @Field(() => TextType, { nullable: true })
  public parentText!: null | Related<TextType> | undefined;

  @Field(() => Int, { nullable: true })
  public printYear!: null | number | undefined;

  @Field(() => String, {
    description: "The province an inscription was found in.",
    nullable: true,
  })
  public province!: null | string | undefined;

  @Field(() => String, { nullable: true })
  public publisher!: null | string | undefined;

  @Field(() => Int, {
    description: "The number of Tokens linked to a dictionary Word.",
    nullable: true,
  })
  public recognisedWordCount!: null | number | undefined;

  @Field()
  public slug!: string;

  @Field(() => Int, {
    description: "The year an inscription is dated from, negative for BCE.",
    nullable: true,
  })
  public startYear!: null | number | undefined;

  @Field()
  public title!: string;

  @Field()
  public type!: string;

  @Field(() => Int, {
    description: "The number of word Tokens in the text.",
    nullable: true,
  })
  public wordCount!: null | number | undefined;

  @Field(() => String, { nullable: true })
  public workIdentifier!: null | string | undefined;
}
