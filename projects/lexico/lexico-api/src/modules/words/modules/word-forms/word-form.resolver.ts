import { Inject } from "@nestjs/common";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { toWordType } from "../../words.utilities";
import { WordLinkLoader } from "../word-lexemes/word-link.loader";
import { WordType } from "../word-queries/word.entities";

import { WordFormType } from "./word-form.entities";

/**
 * Resolves the written word a word-form link belongs to, which the link type
 * leaves to a resolver so the word and its links need not import each other.
 */
@Resolver(() => WordFormType)
export class WordFormResolver {
  // 🏗 Dependency Injection

  public constructor(
    @Inject(WordLinkLoader) private readonly wordLinkLoader: WordLinkLoader,
  ) {}

  // 🔎 Queries

  // 🖋️ Mutations

  // 🔗 Relations

  /** Resolves the word side of a word-form link, batched per request. */
  @ResolveField(() => WordType, { name: "word" })
  public async word(@Parent() wordForm: WordFormType): Promise<WordType> {
    return toWordType(await this.wordLinkLoader.byWordFormId.load(wordForm.id));
  }
}
