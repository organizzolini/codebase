import { Field, ObjectType } from "@nestjs/graphql";

import { InflectionType } from "./inflection.entities";

import type { InflectionDatabaseOnlyField } from "./inflections.types";
import type { GraphQLObjectOf } from "@codebase/interface";
import type {
  VerbConjugation,
  VerbInflection,
} from "@codebase/lexico-entities";

/** How a verb inflects: its conjugation. */
@ObjectType("VerbInflection", { implements: InflectionType })
export class VerbInflectionType
  extends InflectionType
  implements
    GraphQLObjectOf<
      VerbInflection,
      VerbInflectionType,
      InflectionDatabaseOnlyField
    >
{
  @Field(() => String)
  public conjugation!: VerbConjugation;

  @Field(() => String, { nullable: true })
  public other!: string | undefined;
}
