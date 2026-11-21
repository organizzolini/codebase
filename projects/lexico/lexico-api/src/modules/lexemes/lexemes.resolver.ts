import { Inject } from "@nestjs/common";
import { Args as Arguments, Query, Resolver } from "@nestjs/graphql";

import { LexemesService } from "./lexemes.service";
import { toLexemeType } from "./lexemes.utilities";
import { LexemeArguments } from "./modules/lexeme-queries/lexeme-arguments.entities";
import { LexemeType } from "./modules/lexeme-queries/lexeme.entities";
import { LexemesArguments } from "./modules/lexeme-queries/lexemes-arguments.entities";

/**
 * GraphQL resolver exposing dictionary lexeme queries.
 */
@Resolver(() => LexemeType)
export class LexemesResolver {
  // 🏗 Dependency Injection

  public constructor(
    @Inject(LexemesService) private readonly lexemesService: LexemesService,
  ) {}

  // 🔎 Queries

  /**
   * Retrieves a single dictionary lexeme by ID.
   */
  @Query(() => LexemeType, {
    description: "Retrieves a single dictionary lexeme by ID.",
    name: "lexeme",
    nullable: true,
  })
  public async lexeme(
    @Arguments() arguments_: LexemeArguments,
  ): Promise<LexemeType | null> {
    const lexeme = await this.lexemesService.findById(arguments_.id);
    return lexeme === null ? null : toLexemeType(lexeme);
  }

  /**
   * Retrieves multiple dictionary lexemes by ID.
   */
  @Query(() => [LexemeType], {
    description: "Retrieves multiple dictionary lexemes by ID.",
    name: "lexemes",
  })
  public async lexemes(
    @Arguments() arguments_: LexemesArguments,
  ): Promise<LexemeType[]> {
    const lexemes = await this.lexemesService.findByIds(arguments_.ids);
    return lexemes.map((lexeme) => toLexemeType(lexeme));
  }

  // 🖋️ Mutations

  // 🔗 Relations
}
