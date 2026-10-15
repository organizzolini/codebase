import { Field, ID, ObjectType } from "@nestjs/graphql";

import { FormType } from "../lexemes/forms/form.entities";

/**
 * One form of a lexeme and a written word that surfaces as it, such as the
 * genitive singular of "rosa" and "rosae". A form several words can surface as
 * appears once per word.
 */
@ObjectType("LexemeWordForm")
export class LexemeWordFormType {
  /** The form side of the link. */
  @Field(() => FormType)
  public form!: FormType;

  /** The identifier of the link between the form and its word. */
  @Field(() => ID)
  public id!: string;

  /** The word as written. */
  @Field()
  public word!: string;
}
