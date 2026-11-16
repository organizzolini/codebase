import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";

import { authorEra } from "@codebase/lexico-db";

import { DeletableType } from "../../deletable.entities";

import type {
  AuthorDatabaseOnlyField,
  AuthorResolvedField,
} from "./literature.types";
import type { GraphQLObjectOf } from "@codebase/interface";
import type { Author, AuthorEra } from "@codebase/lexico-db";

/** The GraphQL members of an author's era, each naming the stored value. */
export const AUTHOR_ERA_MEMBERS = {
  ARCHAIC: authorEra.archaic,
  CLASSICAL: authorEra.classical,
  IMPERIAL: authorEra.imperial,
  LATE: authorEra.late,
  MEDIEVAL: authorEra.medieval,
  NEO_LATIN: authorEra.neoLatin,
} as const;

registerEnumType(AUTHOR_ERA_MEMBERS, {
  description: "The period an author belongs to.",
  name: "AuthorEra",
});

/** An author of Latin literature. */
@ObjectType("Author")
export class AuthorType
  extends DeletableType
  implements
    GraphQLObjectOf<
      Author,
      AuthorType,
      AuthorDatabaseOnlyField,
      never,
      AuthorResolvedField
    >
{
  @Field(() => Int, {
    description: "The year the author died, negative for BCE.",
    nullable: true,
  })
  public endYear!: null | number | undefined;

  @Field(() => AUTHOR_ERA_MEMBERS, {
    description: "The period the author belongs to.",
    nullable: true,
  })
  public era!: AuthorEra | null | undefined;

  @Field(() => String, { nullable: true })
  public fullName!: null | string | undefined;

  @Field()
  public name!: string;

  @Field()
  public slug!: string;

  @Field(() => Int, {
    description: "The year the author was born, negative for BCE.",
    nullable: true,
  })
  public startYear!: null | number | undefined;
}
