import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { IssueFieldsService } from "../issue/issue-fields.service";
import { IssueMetadataTypeService } from "../issue/issue-metadata-type.service";
import { IssueMetadataService } from "../issue/issue-metadata.service";

import { PullRequestGithubService } from "./pull-request-github.service";
import { NO_LINKED_ISSUE_MESSAGE } from "./pull-request-linked-issues.constants";
import { PullRequestLinkedIssuesService } from "./pull-request-linked-issues.service";

import type { PullRequestContext } from "./pull-request-context.types";
import type { GithubCliResult } from "./pull-request-github.types";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";

const context: PullRequestContext = {
  assignees: [],
  author: "someone",
  body: "Closes #5",
  draft: false,
  labels: [],
  number: 12,
  title: "feat(compliance): add",
};

const COMPLIANT_LABELS = ["type:feat", "scope:compliance", "source:agent"];

/** One issue as the stubbed `gh` serves it. */
interface StubIssue {
  readonly body?: string;
  readonly fields?: null | readonly string[];
  readonly issueType?: string;
  readonly labels?: readonly string[];
  readonly parent?: number;
}

function answer(standardOutput: string, succeeded = true): GithubCliResult {
  return { available: true, standardError: "", standardOutput, succeeded };
}

/** What PullRequestLinkedIssuesService is built with. */
const DEPENDENCIES = {
  mocks: [PullRequestGithubService],
  providers: [
    IssueFieldsService,
    IssueMetadataService,
    IssueMetadataTypeService,
  ],
} satisfies TestingModuleOptions;

describe(PullRequestLinkedIssuesService, () => {
  let service: PullRequestLinkedIssuesService;
  let github: PullRequestGithubService;

  beforeAll(async () => {
    const built = await buildTestingModule(
      PullRequestLinkedIssuesService,
      DEPENDENCIES,
    );

    service = built.instance;
    github = built.mock(PullRequestGithubService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.describeFailure).mockReturnValue("HTTP 500");
  });

  /** Answers `gh pr view` with the linked issues, and each issue by number. */
  function stubGithub(
    linked: string,
    issues: Readonly<Record<number, StubIssue>>,
  ): void {
    vi.mocked(github.run).mockImplementation((arguments_) => {
      if (arguments_[0] === "pr") {
        return answer(linked);
      }

      const number =
        arguments_[0] === "issue"
          ? arguments_[2]
          : /issues\/(?<number>\d+)$/u.exec(arguments_[1] ?? "")?.groups?.[
              "number"
            ];
      const issue = issues[Number(number)];

      if (issue === undefined) {
        return answer("", false);
      }

      if (arguments_[0] === "api") {
        return issue.fields === null
          ? answer("", false)
          : answer(JSON.stringify(issue.fields ?? ["Effort", "Priority"]));
      }

      return answer(
        JSON.stringify({
          body: issue.body ?? "",
          issueType: { name: issue.issueType ?? "Feature" },
          labels: (issue.labels ?? COMPLIANT_LABELS).map((name) => ({ name })),
          parent: issue.parent === undefined ? null : { number: issue.parent },
        }),
      );
    });
  }

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      PullRequestLinkedIssuesService,
      DEPENDENCIES,
    );

    expect(instance).toBeInstanceOf(PullRequestLinkedIssuesService);
  });

  it("passes a compliant root issue carrying Effort and Priority", () => {
    stubGithub("[5]", { 5: {} });

    expect(service.check(context)).toMatchObject({
      failures: [],
      remediationCommands: [],
    });
  });

  it("fails when the pull request closes no issue", () => {
    stubGithub("[]", {});

    expect(service.check(context).failures).toStrictEqual([
      NO_LINKED_ISSUE_MESSAGE,
    ]);
  });

  it("fails when gh cannot read the closed issues", () => {
    vi.mocked(github.run).mockReturnValue(answer("", false));

    expect(service.check(context).failures[0]).toContain("HTTP 500");
  });

  it("fails on unparsable closed-issue output", () => {
    vi.mocked(github.run).mockReturnValue(answer("nope"));

    expect(service.check(context).failures[0]).toContain(
      "Unable to parse the issues closed",
    );
  });

  it("names the issue in each audit failure and keeps its fixes", () => {
    stubGithub("[5]", { 5: { issueType: "Task", labels: ["type:feat"] } });

    const outcome = service.check(context);

    expect(outcome.failures).toStrictEqual([
      "❌ Issue #5: No scope label",
      expect.stringContaining("❌ Issue #5: Expected exactly one source label"),
      expect.stringContaining("❌ Issue #5: A root issue must have"),
    ]);
    expect(outcome.remediationCommands).toContain(
      "gh issue edit 5 --type Feature",
    );
  });

  it("wants Effort on the issue and Priority on its spec, once each", () => {
    stubGithub("[5, 6]", {
      1: { fields: ["Effort"] },
      5: { fields: [], issueType: "Task", parent: 1 },
      6: { fields: ["Effort"], issueType: "Task", parent: 1 },
    });

    const outcome = service.check(context);

    expect(outcome.failures).toStrictEqual([
      "❌ Issue #5: No Effort issue field",
      "❌ Issue #1: No Priority issue field",
    ]);
    expect(outcome.remediationCommands).toStrictEqual([
      `echo '{"issue_field_values":[{"field_id":46460698,"value":"<Low|Medium|High>"}]}' | gh api -X PUT repos/{owner}/{repo}/issues/5/issue-field-values --input -`,
      `echo '{"issue_field_values":[{"field_id":46460695,"value":"<Urgent|High|Medium|Low>"}]}' | gh api -X PUT repos/{owner}/{repo}/issues/1/issue-field-values --input -`,
    ]);
  });

  it("takes a body's parent line when the native parent is unset", () => {
    stubGithub("[5]", {
      1: { fields: [] },
      5: { body: "Part of #1", issueType: "Task" },
    });

    expect(service.check(context).failures).toStrictEqual([
      "❌ Issue #1: No Priority issue field",
    ]);
  });

  it("exempts a commit sub-issue closed beside its parent from the fields", () => {
    stubGithub("[5, 7]", {
      5: {},
      7: { fields: [], issueType: "Task", parent: 5 },
    });

    expect(service.check(context).failures).toStrictEqual([]);
  });

  it("reports an issue whose fields cannot be read", () => {
    stubGithub("[5]", { 5: { fields: null } });

    expect(service.check(context).failures).toStrictEqual([
      "❌ Unable to read the issue fields of issue #5: HTTP 500",
    ]);
  });

  it("reports a parent that cannot be read", () => {
    stubGithub("[5]", { 5: { issueType: "Task", parent: 1 } });

    expect(service.check(context).failures).toStrictEqual([
      "❌ Unable to read issue #1: HTTP 500",
    ]);
  });

  it("reports an issue view it cannot parse", () => {
    vi.mocked(github.run).mockImplementation((arguments_) =>
      answer(arguments_[0] === "pr" ? "[5]" : '{"body":1}'),
    );

    expect(service.check(context).failures[0]).toContain(
      "Unable to parse issue #5",
    );
  });
});
