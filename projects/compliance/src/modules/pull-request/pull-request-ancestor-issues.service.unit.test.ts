import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { IssueMetadataService } from "../issue/issue-metadata.service";

import { PullRequestAncestorIssuesService } from "./pull-request-ancestor-issues.service";
import { PullRequestBodyLinksService } from "./pull-request-body-links.service";
import { PullRequestClosingReferencesService } from "./pull-request-closing-references.service";
import { PullRequestDescendantIssuesService } from "./pull-request-descendant-issues.service";
import { PullRequestGithubService } from "./pull-request-github.service";

import type { PullRequestContext } from "./pull-request-context.types";
import type { GithubCliResult } from "./pull-request-github.types";

const context: PullRequestContext = {
  assignees: [],
  author: "someone",
  body: "Closes #5",
  draft: false,
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

describe(PullRequestAncestorIssuesService, () => {
  let service: PullRequestAncestorIssuesService;
  let github: PullRequestGithubService;
  let children: PullRequestDescendantIssuesService;
  let links: PullRequestBodyLinksService;
  let closing: PullRequestClosingReferencesService;
  let metadata: IssueMetadataService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PullRequestAncestorIssuesService,
        {
          provide: IssueMetadataService,
          useValue: createMock<IssueMetadataService>(),
        },
        {
          provide: PullRequestDescendantIssuesService,
          useValue: createMock<PullRequestDescendantIssuesService>(),
        },
        {
          provide: PullRequestGithubService,
          useValue: createMock<PullRequestGithubService>(),
        },
        {
          provide: PullRequestBodyLinksService,
          useValue: createMock<PullRequestBodyLinksService>(),
        },
        {
          provide: PullRequestClosingReferencesService,
          useValue: createMock<PullRequestClosingReferencesService>(),
        },
      ],
    }).compile();

    service = await module.resolve(PullRequestAncestorIssuesService);
    github = await module.resolve(PullRequestGithubService);
    children = await module.resolve(PullRequestDescendantIssuesService);
    links = await module.resolve(PullRequestBodyLinksService);
    closing = await module.resolve(PullRequestClosingReferencesService);
    metadata = await module.resolve(IssueMetadataService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.describeFailure).mockReturnValue("HTTP 500");
    vi.mocked(metadata.extractParentIssueNumber).mockReturnValue(undefined);
    vi.mocked(children.collect).mockReturnValue({ ok: true, value: [] });
    vi.mocked(closing.close).mockReturnValue({ failures: [], lines: [] });
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
      lines: ["ℹ️ No linked issues; no ancestor references to add"],
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

  it("closes the open descendants of the linked issues", () => {
    stubGithub({ linked: "[5]", parents: { "5": 3 } });
    vi.mocked(children.collect).mockReturnValue({ ok: true, value: [8, 9] });
    vi.mocked(links.addRelatedIssueReferences).mockReturnValue("new body");

    const result = service.link(context);

    expect(links.addRelatedIssueReferences).toHaveBeenLastCalledWith(
      "new body",
      [8, 9],
      "Closes",
    );
    expect(result.outcome.lines).toStrictEqual([
      "✅ Added ancestor issue references: #3",
      "✅ Added closing descendant issue references: #8, #9",
    ]);
  });

  it("reports only descendants when the linked issues have no ancestors", () => {
    stubGithub({ linked: "[5]" });
    vi.mocked(children.collect).mockReturnValue({ ok: true, value: [8] });
    vi.mocked(links.addRelatedIssueReferences).mockReturnValue("new body");

    expect(service.link(context).outcome.lines).toStrictEqual([
      "✅ Added closing descendant issue references: #8",
    ]);
  });

  it("collects a shared ancestor once across several linked issues", () => {
    stubGithub({ linked: "[5,6]", parents: { "3": 1, "5": 3, "6": 3 } });
    vi.mocked(links.addRelatedIssueReferences).mockReturnValue("new body");

    service.link(context);

    expect(links.addRelatedIssueReferences).toHaveBeenCalledWith(
      "Closes #5",
      [3, 1],
    );
  });

  it("fails when the descendants cannot be read", () => {
    stubGithub({ linked: "[5]" });
    vi.mocked(children.collect).mockReturnValue({
      failure: "❌ nope",
      ok: false,
    });

    expect(service.link(context).outcome.failures).toStrictEqual(["❌ nope"]);
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
      "✅ Ancestor issue references are already present",
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

  it("links the open descendants as real closing references", () => {
    stubGithub({ linked: "[5]" });
    vi.mocked(children.collect).mockReturnValue({ ok: true, value: [8, 9] });
    vi.mocked(links.addRelatedIssueReferences).mockReturnValue("Closes #5");
    vi.mocked(closing.close).mockReturnValue({
      failures: ["❌ nope"],
      lines: ["✅ Linked closing issue #8"],
    });

    const result = service.link(context);

    expect(closing.close).toHaveBeenCalledWith(12, [8, 9]);
    expect(result.outcome.failures).toStrictEqual(["❌ nope"]);
    expect(result.outcome.lines).toContain("✅ Linked closing issue #8");
  });

  it("skips descendants that are already closing references", () => {
    stubGithub({ linked: "[5,8]" });
    vi.mocked(children.collect).mockReturnValue({ ok: true, value: [8, 9] });
    vi.mocked(links.addRelatedIssueReferences).mockReturnValue("Closes #5");

    service.link(context);

    expect(closing.close).toHaveBeenCalledWith(12, [9]);
  });

  it("stops linking descendants at GitHub's manual reference limit", () => {
    stubGithub({ linked: "[1,2,3,4,5,6,7,8]" });
    vi.mocked(children.collect).mockReturnValue({
      ok: true,
      value: [20, 21, 22, 23],
    });
    vi.mocked(links.addRelatedIssueReferences).mockReturnValue("Closes #5");

    service.link(context);

    expect(closing.close).toHaveBeenCalledWith(12, [20, 21]);
  });

  it("accepts a Closes line for descendants past the reference limit", () => {
    stubGithub({ linked: "[1,2,3,4,5,6,7,8,9,10]" });
    vi.mocked(children.collect).mockReturnValue({ ok: true, value: [20, 21] });

    expect(
      service.verify({ ...context, body: "Closes #20" }).failures,
    ).toStrictEqual([
      "❌ Open descendant issues are not closed by this pull request: #21",
    ]);
  });

  it("verifies a pull request that links its whole hierarchy", () => {
    stubGithub({ linked: "[5]", parents: { "5": 3 } });
    vi.mocked(children.collect).mockReturnValue({ ok: true, value: [5] });

    expect(
      service.verify({ ...context, body: "Related to #3" }).failures,
    ).toStrictEqual([]);
  });

  it("fails verification when an open descendant is not closed", () => {
    stubGithub({ linked: "[5]" });
    vi.mocked(children.collect).mockReturnValue({ ok: true, value: [8] });

    expect(service.verify(context).failures[0]).toContain(
      "Open descendant issues are not closed by this pull request: #8",
    );
  });

  it("fails verification when an ancestor is not mentioned", () => {
    stubGithub({ linked: "[5]", parents: { "5": 3 } });

    expect(service.verify(context).failures[0]).toContain(
      "Ancestor issues are not referenced in the description: #3",
    );
  });

  it("fails verification when the hierarchy cannot be read", () => {
    stubGithub({ linked: "[5]" });
    vi.mocked(children.collect).mockReturnValue({
      failure: "❌ no descendants",
      ok: false,
    });

    expect(service.verify(context).failures).toStrictEqual([
      "❌ no descendants",
    ]);
  });

  it("fails verification when the linked issues cannot be read", () => {
    vi.mocked(github.run).mockReturnValue(failed);

    expect(service.verify(context).failures).toHaveLength(1);
  });

  it("exempts draft and Dependabot pull requests from verification", () => {
    stubGithub({ linked: "[5]" });
    vi.mocked(children.collect).mockReturnValue({ ok: true, value: [8] });

    expect(service.verify({ ...context, draft: true }).failures).toStrictEqual(
      [],
    );
    expect(
      service.verify({ ...context, author: "dependabot[bot]" }).failures,
    ).toStrictEqual([]);
  });
});
