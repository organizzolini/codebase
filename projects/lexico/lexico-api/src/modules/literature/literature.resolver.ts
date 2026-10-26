import { Inject } from "@nestjs/common";
import { Args as Arguments, Query, Resolver } from "@nestjs/graphql";

import { mapConnection } from "@codebase/interface";

import { LiteratureSearchResult } from "./literature-search-result.entities";
import { LiteratureService } from "./literature.service";
import { toAuthorType, toLineType, toTextType } from "./literature.utilities";
import { SearchLiteratureArguments } from "./search-literature-arguments.entities";

/**
 * GraphQL resolver for aggregated Literature search.
 */
@Resolver()
export class LiteratureResolver {
  // 🏗 Dependency Injection

  public constructor(
    @Inject(LiteratureService)
    private readonly literatureService: LiteratureService,
  ) {}

  // 🔎 Queries

  /** Searches authors, texts, and lines together. */
  @Query(() => LiteratureSearchResult, { name: "searchLiterature" })
  public async searchLiterature(
    @Arguments() arguments_: SearchLiteratureArguments,
  ): Promise<LiteratureSearchResult> {
    const results = await this.literatureService.searchLiterature(
      arguments_.query,
      arguments_.authorId,
    );
    return {
      authors: mapConnection(results.authors, toAuthorType),
      lines: mapConnection(results.lines, toLineType),
      texts: mapConnection(results.texts, toTextType),
    };
  }

  // 🖋️ Mutations

  // 🔗 Relations
}
