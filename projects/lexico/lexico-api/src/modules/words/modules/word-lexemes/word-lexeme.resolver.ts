import { Inject } from "@nestjs/common";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { toWordType } from "../../words.utilities";
import { WordType } from "../word-queries/word.entities";

import { WordLexemeType } from "./word-lexeme.entities";
import { WordLinkLoader } from "./word-link.loader";

/**
 * Resolves the written word a word-lexeme link belongs to, which the link
 * type leaves to a resolver so the word and its links need not import each
 * other.
 */
@Resolver(() => WordLexemeType)
export class WordLexemeResolver {
  // 🏗 Dependency Injection

  public constructor(
    @Inject(WordLinkLoader) private readonly wordLinkLoader: WordLinkLoader,
  ) {}

  // 🔎 Queries

  // 🖋️ Mutations

  // 🔗 Relations

  /** Resolves the word side of a word-lexeme link, batched per request. */
  @ResolveField(() => WordType, { name: "word" })
  public async word(@Parent() wordLexeme: WordLexemeType): Promise<WordType> {
    return toWordType(
      await this.wordLinkLoader.byWordLexemeId.load(wordLexeme.id),
    );
  }
}
