/* cspell:words FULLTEXT */

import {
  Field,
  Float,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";

import { Paginated } from "@codebase/interface";

import { LexemeType } from "../lexemes/lexeme.entities";

/**
 * Search match classification source.
 */
export enum SearchMatchSource {
  ENCLITIC = "ENCLITIC",
  FUZZY = "FUZZY",
  LEMMA_EXACT = "LEMMA_EXACT",
  PREFIX = "PREFIX",
  TRANSLATION_EXACT = "TRANSLATION_EXACT",
  TRANSLATION_FULLTEXT = "TRANSLATION_FULLTEXT",
  TRANSLATION_PREFIX = "TRANSLATION_PREFIX",
  WORD_EXACT = "WORD_EXACT",
}

registerEnumType(SearchMatchSource, {
  description: "Classification of where and how a search match was found.",
  name: "SearchMatchSource",
});

/**
 * Single search result node wrapping a Lexeme with match metadata.
 */
@ObjectType()
export class LexemeSearchResult {
  @Field(() => Int, {
    description: "Edit distance of a fuzzy match from the search term",
    nullable: true,
  })
  public distance?: null | number;

  @Field(() => String, {
    description:
      "Enclitic suffix separated from search token (e.g. que, ve, ne)",
    nullable: true,
  })
  public enclitic?: null | string;

  @Field(() => [String], {
    description: "Morphological and grammatical tags identifying matched form",
  })
  public identifiers!: string[];

  @Field(() => LexemeType, { description: "Matched dictionary lexeme entry" })
  public lexeme!: LexemeType;

  @Field(() => Float, { description: "Computed search relevance score" })
  public score!: number;

  @Field(() => SearchMatchSource, {
    description: "Source and confidence tier of match",
  })
  public source!: SearchMatchSource;
}

/**
 * Relay Connection for paginated lexeme search results.
 */
export const LexemeSearchConnection = Paginated(LexemeSearchResult);
