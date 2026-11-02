import { createMock } from "@golevelup/ts-vitest";
import { describe, expect, it, vi } from "vitest";

import { Token } from "@codebase/lexico-entities";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { LiteratureService } from "./literature.service";
import { TokensResolver } from "./tokens.resolver";

describe(TokensResolver, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(TokensResolver, {
      mocks: [LiteratureService],
    });

    expect(instance).toBeInstanceOf(TokensResolver);
  });

  it("returns a paginated connection for tokens", async () => {
    expect.hasAssertions();

    const token = new Token();
    token.id = "token-1";

    const mockService = createMock<LiteratureService>({
      listTokensForLineConnection: vi
        .fn<LiteratureService["listTokensForLineConnection"]>()
        .mockResolvedValue({
          edges: [{ cursor: "to", node: token }],
          pageInfo: {
            endCursor: "to",
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: "to",
          },
          totalCount: 1,
        }),
    });

    const tokensResolver = new TokensResolver(mockService);

    await expect(
      tokensResolver.tokens({
        after: "cursor-1",
        before: "cursor-0",
        first: 10,
        last: 5,
        lineId: "line-1",
      }),
    ).resolves.toMatchObject({
      edges: [{ node: token }],
      totalCount: 1,
    });
  });
});
