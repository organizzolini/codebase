import { Inject } from "@nestjs/common";
import { Args as Arguments, Query, Resolver } from "@nestjs/graphql";

import { mapConnection } from "@codebase/interface";

import { TokenConnectionType } from "./literature-connection.entities";
import { LiteratureService } from "./literature.service";
import { toTokenType } from "./literature.utilities";
import { TokenType } from "./token.entities";
import { TokensArguments } from "./tokens-arguments.entities";

import type { Connection } from "@codebase/interface";

/**
 * GraphQL resolver for Tokens.
 */
@Resolver(() => TokenType)
export class TokensResolver {
  // 🏗 Dependency Injection

  public constructor(
    @Inject(LiteratureService)
    private readonly literatureService: LiteratureService,
  ) {}

  // 🔎 Queries

  /** Lists tokens for a line. */
  @Query(() => TokenConnectionType, { name: "tokens" })
  public async tokens(
    @Arguments() arguments_: TokensArguments,
  ): Promise<Connection<TokenType>> {
    const tokens = await this.literatureService.listTokensForLineConnection(
      arguments_.lineId,
      arguments_,
    );
    return mapConnection(tokens, toTokenType);
  }

  // 🖋️ Mutations

  // 🔗 Relations
}
