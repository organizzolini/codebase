import { Field, ID, ObjectType } from "@nestjs/graphql";

import type { PartOfSpeech } from "@codebase/lexico-db";

/**
 * One reading a clicked word can take: a lexeme and the form the word surfaces
 * as, such as "ablative singular" of "arma".
 */
@ObjectType("WordCandidate")
export class WordCandidateType {
  /** The first English translation of the lexeme, or null when it has none. */
  @Field(() => String, { nullable: true })
  public definition!: null | string;

  /** The grammatical description of the matched form, such as "ablative singular". */
  @Field()
  public description!: string;

  /** The dictionary headword of the lexeme. */
  @Field()
  public lemma!: string;

  /** The identifier of the lexeme. */
  @Field(() => ID)
  public lexemeId!: string;

  /** The part of speech of the lexeme. */
  @Field(() => String)
  public partOfSpeech!: PartOfSpeech;
}
