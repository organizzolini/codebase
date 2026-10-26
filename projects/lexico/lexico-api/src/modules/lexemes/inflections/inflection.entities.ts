import { Field, ID, InterfaceType } from "@nestjs/graphql";

import type { InflectionDatabaseOnlyField } from "./inflections.types";
import type { GraphQLObjectOf } from "@codebase/interface";
import type { Inflection } from "@codebase/lexico-entities";

/**
 * How a lexeme inflects. Each part of speech's inflection is its own object
 * type implementing this interface, resolved by which class it is mapped to.
 */
@InterfaceType("Inflection")
export abstract class InflectionType implements GraphQLObjectOf<
  Inflection,
  InflectionType,
  InflectionDatabaseOnlyField
> {
  @Field(() => ID)
  public id!: string;
}
