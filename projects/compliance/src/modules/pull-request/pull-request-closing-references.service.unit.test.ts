import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { PullRequestClosingReferencesService } from "./pull-request-closing-references.service";
import { PullRequestGithubService } from "./pull-request-github.service";

import type { GithubCliResult } from "./pull-request-github.types";

function succeeded(standardOutput: string): GithubCliResult {
  return {
    available: true,
    standardError: "",
    standardOutput,
    succeeded: true,
  };
}

const failed: GithubCliResult = {
  available: true,
  standardError: "",
  standardOutput: "",
  succeeded: false,
};

describe(PullRequestClosingReferencesService, () => {
  let service: PullRequestClosingReferencesService;
  let github: PullRequestGithubService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PullRequestClosingReferencesService,
        {
          provide: PullRequestGithubService,
          useValue: createMock<PullRequestGithubService>(),
        },
      ],
    }).compile();

    service = await module.resolve(PullRequestClosingReferencesService);
    github = await module.resolve(PullRequestGithubService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.describeFailure).mockReturnValue("HTTP 500");
    vi.mocked(github.run).mockReturnValue(succeeded("node-id\n"));
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("does nothing when there are no issues", () => {
    expect(service.close(12, [])).toStrictEqual({ failures: [], lines: [] });
    expect(github.run).not.toHaveBeenCalled();
  });

  it("links each issue through the closing-reference mutation", () => {
    const outcome = service.close(12, [8, 9]);

    expect(outcome.lines).toStrictEqual([
      "✅ Linked closing issue #8",
      "✅ Linked closing issue #9",
    ]);
    expect(github.run).toHaveBeenCalledWith(
      expect.arrayContaining(["api", "graphql", "pullRequest=node-id"]),
    );
  });

  it("fails when the pull request id cannot be read", () => {
    vi.mocked(github.run).mockReturnValue(failed);

    expect(service.close(12, [8]).failures[0]).toContain("pull request 12");
  });

  it("fails when an issue id cannot be read", () => {
    vi.mocked(github.run)
      .mockReturnValueOnce(succeeded("pr-id"))
      .mockReturnValueOnce(failed);

    expect(service.close(12, [8]).failures[0]).toContain("issue 8");
  });

  it("fails when the mutation is rejected", () => {
    vi.mocked(github.run)
      .mockReturnValueOnce(succeeded("pr-id"))
      .mockReturnValueOnce(succeeded("issue-id"))
      .mockReturnValueOnce(failed);

    expect(service.close(12, [8]).failures[0]).toContain(
      "Unable to link issue 8",
    );
  });
});
