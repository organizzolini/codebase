import { Inject } from "@nestjs/common";
import { Args as Arguments, Query, Resolver } from "@nestjs/graphql";

import { WordCandidateType } from "./word-candidate.entities";
import { WordCandidatesArguments } from "./word-candidates-arguments.entities";
import { WordCandidatesService } from "./word-candidates.service";
import { toWordCandidates } from "./word-candidates.utilities";

/**
 * GraphQL resolver listing the readings a clicked word can take.
 */
@Resolver(() => WordCandidateType)
export class WordCandidatesResolver {
  // 🏗 Dependency Injection

  public constructor(
    @Inject(WordCandidatesService)
    private readonly wordCandidatesService: WordCandidatesService,
  ) {}

  // 🔎 Queries

  /** Lists every reading of a token's word, or none when it has no word. */
  @Query(() => [WordCandidateType], {
    description:
      "Lists the lexeme and form candidates a token's word can be, for a word card.",
    name: "wordCandidates",
  })
  public async wordCandidates(
    @Arguments() arguments_: WordCandidatesArguments,
  ): Promise<WordCandidateType[]> {
    const wordForms = await this.wordCandidatesService.findWordFormsForToken(
      arguments_.tokenId,
    );
    return toWordCandidates(wordForms);
  }

  // 🖋️ Mutations

  // 🔗 Relations
}
