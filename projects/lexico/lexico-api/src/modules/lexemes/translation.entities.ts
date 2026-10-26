import { Field, ObjectType } from "@nestjs/graphql";

import { DeletableType } from "../../deletable.entities";

import type { TranslationDatabaseOnlyField } from "./lexemes.types";
import type { GraphQLObjectOf } from "@codebase/interface";
import type { Translation } from "@codebase/lexico-entities";

/** One English translation of a lexeme. */
@ObjectType("Translation")
export class TranslationType
  extends DeletableType
  implements
    GraphQLObjectOf<Translation, TranslationType, TranslationDatabaseOnlyField>
{
  @Field()
  public data!: string;
}
