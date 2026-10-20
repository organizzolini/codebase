import { Field, ObjectType } from "@nestjs/graphql";

import { DeletableType } from "../../deletable.entities";
import { LexemeType } from "../lexemes/lexeme.entities";

import type {
  WordLexemeRelationField,
  WordLexemeResolvedField,
} from "./words.types";
import type { GraphQLObjectOf, Related } from "@codebase/interface";
import type { WordLexeme } from "@codebase/lexico-entities";

/** Links a written word to one lexeme it can represent. */
@ObjectType("WordLexeme")
export class WordLexemeType
  extends DeletableType
  implements
    GraphQLObjectOf<
      WordLexeme,
      WordLexemeType,
      never,
      WordLexemeRelationField,
      WordLexemeResolvedField
    >
{
  /** The dictionary entry side of the link. */
  @Field(() => LexemeType)
  public lexeme!: Related<LexemeType>;
}
