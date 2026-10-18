import { Field, ObjectType } from "@nestjs/graphql";

import { DeletableType } from "../../deletable.entities";

import {
  WordFormConnectionType,
  WordLexemeConnectionType,
} from "./word-connection.entities";
import { WordFormType } from "./word-form.entities";
import { WordLexemeType } from "./word-lexeme.entities";

import type { Connection, GraphQLObjectOf } from "../../lexico-api.types";
import type { WordRelationField } from "./words.types";
import type { Word } from "@codebase/lexico-entities";

/** A written Latin word, linked to every form and lexeme it can be. */
@ObjectType("Word")
export class WordType
  extends DeletableType
  implements GraphQLObjectOf<Word, WordType, never, WordRelationField>
{
  @Field()
  public data!: string;

  /** Every morphological form this word can surface as. */
  @Field(() => WordFormConnectionType)
  public wordForms!: Connection<WordFormType>;

  /** Every lexeme this word can represent. */
  @Field(() => WordLexemeConnectionType)
  public wordLexemes!: Connection<WordLexemeType>;
}
