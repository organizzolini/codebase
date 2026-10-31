import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { IssueMetadataService } from "../issue/issue-metadata.service";

import { PullRequestGithubService } from "./pull-request-github.service";
import { PullRequestParentIssuesService } from "./pull-request-parent-issues.service";
import { PullRequestParentLinksService } from "./pull-request-parent-links.service";

import type { PullRequestContext } from "./pull-request-context.types";
import type { GithubCliResult } from "./pull-request-github.types";

const context: PullRequestContext = {
  assignees: [],
  author: "someone",
  body: "Closes #5",
  labels: [],
  number: 12,
  title: "feat: add",
};

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

describe(PullRequestParentIssuesService, () => {
  let service: PullRequestParentIssuesService;
  let github: PullRequestGithubService;
  let links: PullRequestParentLinksService;
  let metadata: IssueMetadataService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PullRequestParentIssuesService,
        {
          provide: IssueMetadataService,
          useValue: createMock<IssueMetadataService>(),
        },
        {
          provide: PullRequestGithubService,
          useValue: createMock<PullRequestGithubService>(),
        },
        {
          provide: PullRequestParentLinksService,
          useValue: createMock<PullRequestParentLinksService>(),
        },
      ],
    }).compile();

    service = await module.resolve(PullRequestParentIssuesService);
    github = await module.resolve(PullRequestGithubService);
    links = await module.resolve(PullRequestParentLinksService);
    metadata = await module.resolve(IssueMetadataService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.describeFailure).mockReturnValue("HTTP 500");
    vi.mocked(metadata.extractParentIssueNumber).mockReturnValue(undefined);
  });

  /** Answers `gh pr view` with the linked issues and `gh api` by issue. */
  function stubGithub(options: {
    readonly linked: string;
    readonly parents?: Record<string, null | number>;
    readonly update?: GithubCliResult;
  }): void {
    vi.mocked(github.run).mockImplementation((arguments_) => {
      if (arguments_[0] === "pr") {
        return succeeded(options.linked);
      }

      const issue = arguments_[0] === "issue" ? arguments_[2] : undefined;

      if (issue === undefined) {
        return options.update ?? succeeded("{}");
      }

      const parent = options.parents?.[issue] ?? null;

      return succeeded(
        JSON.stringify({
          body: "",
          parent: parent === null ? null : { number: parent },
        }),
      );
    });
  }

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("fails when the linked issues cannot be read", () => {
    vi.mocked(github.run).mockReturnValue(failed);

    expect(service.link(context).outcome.failures).toHaveLength(1);
  });

  it("fails when the linked issues cannot be parsed", () => {
    vi.mocked(github.run).mockReturnValue(succeeded("nope"));

    expect(service.link(context).outcome.failures[0]).toContain(
      "Unable to parse",
    );
  });

  it("does nothing when no issue is linked", () => {
    stubGithub({ linked: "[]" });

    expect(service.link(context).outcome).toStrictEqual({
      failures: [],
      lines: ["ℹ️ No linked issues; no parent references to add"],
    });
  });

  it("adds every ancestor of the linked issues and writes the body", () => {
    stubGithub({ linked: "[5]", parents: { "3": 1, "5": 3 } });
    vi.mocked(links.addRelatedIssueReferences).mockReturnValue("new body");

    const result = service.link(context);

    expect(links.addRelatedIssueReferences).toHaveBeenCalledWith(
      "Closes #5",
      [3, 1],
    );
    expect(result.body).toBe("new body");
    expect(result.outcome.lines[0]).toContain("#3, #1");
  });

  it("falls back to the parent named in the issue body", () => {
    stubGithub({ linked: "[5]" });
    vi.mocked(metadata.extractParentIssueNumber).mockReturnValueOnce(3);
    vi.mocked(links.addRelatedIssueReferences).mockReturnValue("new body");

    expect(service.link(context).outcome.lines[0]).toContain("#3");
  });

  it("stops climbing at a cycle", () => {
    stubGithub({ linked: "[5]", parents: { "3": 5, "5": 3 } });
    vi.mocked(links.addRelatedIssueReferences).mockReturnValue("Closes #5");

    expect(service.link(context).outcome.failures).toStrictEqual([]);
  });

  it("says so when the references are already present", () => {
    stubGithub({ linked: "[5]", parents: { "5": 3 } });
    vi.mocked(links.addRelatedIssueReferences).mockReturnValue("Closes #5");

    expect(service.link(context).outcome.lines).toStrictEqual([
      "✅ Parent issue references are already present",
    ]);
  });

  it("fails when the references cannot be added", () => {
    stubGithub({ linked: "[5]", parents: { "5": 3 } });
    vi.mocked(links.addRelatedIssueReferences).mockImplementation(() => {
      throw new Error("bad body");
    });

    expect(service.link(context).outcome.failures[0]).toContain("bad body");
  });

  it("fails when the references throw a non-error", () => {
    const thrown: unknown = "bad text";

    stubGithub({ linked: "[5]", parents: { "5": 3 } });
    vi.mocked(links.addRelatedIssueReferences).mockImplementation(() => {
      throw thrown;
    });

    expect(service.link(context).outcome.failures[0]).toContain("bad text");
  });

  it("fails when the description cannot be updated", () => {
    stubGithub({ linked: "[5]", parents: { "5": 3 }, update: failed });
    vi.mocked(links.addRelatedIssueReferences).mockReturnValue("new body");

    const result = service.link(context);

    expect(result.body).toBe("Closes #5");
    expect(result.outcome.failures[0]).toContain("Unable to update");
  });

  it("fails when a parent cannot be read", () => {
    vi.mocked(github.run).mockImplementation((arguments_) =>
      arguments_[0] === "pr" ? succeeded("[5]") : failed,
    );

    expect(service.link(context).outcome.failures[0]).toContain(
      "Unable to read issue 5",
    );
  });
});
