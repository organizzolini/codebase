import { Inject } from "@nestjs/common";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { LexemeType } from "../lexemes/lexeme.entities";

import { LexemeWordFormType } from "./lexeme-word-form.entities";
import { LexemeWordFormLoader } from "./lexeme-word-form.loader";
import { toLexemeWordFormType } from "./words.utilities";

/**
 * Resolves the written words behind a lexeme's forms, which the lexeme type
 * leaves to a resolver so the dictionary and the word tables need not import
 * each other.
 */
@Resolver(() => LexemeType)
export class LexemeWordFormResolver {
  // 🏗 Dependency Injection

  public constructor(
    @Inject(LexemeWordFormLoader)
    private readonly lexemeWordFormLoader: LexemeWordFormLoader,
  ) {}

  // 🔎 Queries

  // 🖋️ Mutations

  // 🔗 Relations

  /**
   * Resolves every written word that surfaces as one of this lexeme's forms,
   * batched into one query per request however many lexemes are returned.
   */
  @ResolveField(() => [LexemeWordFormType], {
    description:
      "Every written word that surfaces as one of this lexeme's forms, such as the genitive singular of rosa written rosae.",
    name: "wordForms",
  })
  public async wordForms(
    @Parent() lexeme: LexemeType,
  ): Promise<LexemeWordFormType[]> {
    const wordForms = await this.lexemeWordFormLoader.byLexemeId.load(
      lexeme.id,
    );

    return wordForms.map((wordForm) => toLexemeWordFormType(wordForm));
  }
}
