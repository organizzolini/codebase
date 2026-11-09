import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { PullRequestAncestorIssuesService } from "./pull-request-ancestor-issues.service";
import { PullRequestBodyService } from "./pull-request-body.service";
import { PullRequestGithubService } from "./pull-request-github.service";
import { PullRequestLabelsAssigneesService } from "./pull-request-labels-assignees.service";
import { PullRequestReleaseSignificanceService } from "./pull-request-release-significance.service";
import { PullRequestTitleService } from "./pull-request-title.service";
import { PullRequestValidationService } from "./pull-request-validation.service";

import type { PullRequestContext } from "./pull-request-context.types";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";

const context: PullRequestContext = {
  assignees: ["owner"],
  author: "someone",
  body: "## Summary\ntext",
  draft: false,
  labels: [],
  number: 12,
  title: "feat(scope): add",
};

/** What PullRequestValidationService is built with. */
const DEPENDENCIES = {
  mocks: [
    PullRequestAncestorIssuesService,
    PullRequestBodyService,
    PullRequestGithubService,
    PullRequestLabelsAssigneesService,
    PullRequestReleaseSignificanceService,
    PullRequestTitleService,
  ],
} satisfies TestingModuleOptions;

describe(PullRequestValidationService, () => {
  let service: PullRequestValidationService;
  let ancestors: PullRequestAncestorIssuesService;
  let body: PullRequestBodyService;
  let github: PullRequestGithubService;
  let metadata: PullRequestLabelsAssigneesService;
  let significance: PullRequestReleaseSignificanceService;
  let title: PullRequestTitleService;

  beforeAll(async () => {
    const built = await buildTestingModule(
      PullRequestValidationService,
      DEPENDENCIES,
    );

    service = built.instance;
    ancestors = built.mock(PullRequestAncestorIssuesService);
    body = built.mock(PullRequestBodyService);
    github = built.mock(PullRequestGithubService);
    metadata = built.mock(PullRequestLabelsAssigneesService);
    significance = built.mock(PullRequestReleaseSignificanceService);
    title = built.mock(PullRequestTitleService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(title.check).mockReturnValue([]);
    vi.mocked(ancestors.verify).mockReturnValue({
      failures: [],
      heading: "hierarchy",
      remediationCommands: [],
      successMessage: "ok",
    });
    vi.mocked(body.extractTemplateComments).mockReturnValue([]);
    vi.mocked(body.checkBody).mockReturnValue({
      emptySections: [],
      malformedSections: [],
      missingHeadings: [],
      oversizedSections: [],
      unfilledComments: [],
    });
    vi.mocked(metadata.parseTitle).mockReturnValue({
      scopes: ["scope"],
      type: "feat",
    });
    vi.mocked(metadata.checkMetadata).mockReturnValue({
      failures: [],
      remediationCommands: [],
    });
    vi.mocked(significance.parseConventionalSubject).mockReturnValue({
      breaking: false,
      scopes: [],
      type: "feat",
    });
    vi.mocked(github.run).mockImplementation((arguments_) => ({
      available: true,
      standardError: "",
      standardOutput: arguments_.includes("closingIssuesReferences")
        ? "[5]"
        : "{}",
      succeeded: true,
    }));
    vi.mocked(github.describeFailure).mockReturnValue("HTTP 500");
    vi.mocked(significance.resolveFromDocument).mockReturnValue({
      commits: [],
      resolved: true,
      title: "feat: add",
    });
    vi.mocked(significance.readReleaseRules).mockReturnValue([]);
    vi.mocked(significance.checkSignificance).mockReturnValue({
      failures: [],
    });
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      PullRequestValidationService,
      DEPENDENCIES,
    );

    expect(instance).toBeInstanceOf(PullRequestValidationService);
  });

  it("runs all five checks and passes when nothing is wrong", () => {
    const outcomes = service.validate(context);

    expect(outcomes).toHaveLength(6);
    expect(outcomes.flatMap((outcome) => outcome.failures)).toStrictEqual([]);
  });

  it("reports every failing check together", () => {
    vi.mocked(title.check).mockReturnValue(["bad title"]);
    vi.mocked(metadata.checkMetadata).mockReturnValue({
      failures: ["bad label"],
      remediationCommands: ["gh pr edit"],
    });

    const failures = service
      .validate({ ...context, body: "" })
      .flatMap((outcome) => outcome.failures);

    expect(failures).toContain("bad title");
    expect(failures).toContain("bad label");
    expect(failures).toHaveLength(3);
  });

  it("describes every kind of body failure", () => {
    vi.mocked(body.checkBody).mockReturnValue({
      emptySections: ["## Details"],
      malformedSections: ["## Testing"],
      missingHeadings: ["## Summary"],
      oversizedSections: ["## Details"],
      unfilledComments: ["<!-- x -->"],
    });

    const [, bodyOutcome] = service.validate(context);

    expect(bodyOutcome?.failures.join("\n")).toContain("Summary");
    expect(bodyOutcome?.failures.join("\n")).toContain("  - ## Testing");
  });

  it("exempts the title and body of a Dependabot pull request only", () => {
    const outcomes = service.validate({
      ...context,
      author: "dependabot[bot]",
    });

    expect(outcomes).toHaveLength(3);
    expect(title.check).not.toHaveBeenCalled();
  });

  it("fails when the pull request closes no issue", () => {
    vi.mocked(github.run).mockImplementation((arguments_) => ({
      available: true,
      standardError: "",
      standardOutput: arguments_.includes("closingIssuesReferences")
        ? "[]"
        : "{}",
      succeeded: true,
    }));

    const outcome = service.validate(context)[4];

    expect(outcome?.failures[0]).toContain("No issue is closed");
  });

  it("skips the linked-issue check for a draft pull request", () => {
    expect(service.validate({ ...context, draft: true })).toHaveLength(5);
  });

  it("fails the linked-issue check when gh cannot read the issues", () => {
    vi.mocked(github.run).mockReturnValue({
      available: true,
      standardError: "",
      standardOutput: "",
      succeeded: false,
    });

    expect(service.validate(context)[4]?.failures[0]).toContain("HTTP 500");
  });

  it("fails the linked-issue check on unparsable output", () => {
    vi.mocked(github.run).mockReturnValue({
      available: true,
      standardError: "",
      standardOutput: "nope",
      succeeded: true,
    });

    expect(service.validate(context)[4]?.failures[0]).toContain(
      "Unable to parse the issues closed",
    );
  });

  it("fails metadata and significance on a title that does not parse", () => {
    vi.mocked(metadata.parseTitle).mockReturnValue(undefined);
    vi.mocked(significance.parseConventionalSubject).mockReturnValue(undefined);

    const outcomes = service.validate(context);
    const metadataOutcome = outcomes[2];
    const significanceOutcome = outcomes[3];

    expect(metadataOutcome?.failures).toHaveLength(1);
    expect(significanceOutcome?.failures).toHaveLength(1);
  });

  it("fails significance when gh cannot read the pull request", () => {
    vi.mocked(github.run).mockReturnValue({
      available: true,
      standardError: "",
      standardOutput: "",
      succeeded: false,
    });

    const outcomes = service.validate(context);

    expect(outcomes[3]?.failures[0]).toContain("HTTP 500");
  });

  it("fails significance when the commits do not resolve", () => {
    vi.mocked(significance.resolveFromDocument).mockReturnValue({
      failure: "❌ unreadable",
      resolved: false,
    });

    expect(service.validate(context)[3]?.failures).toStrictEqual([
      "❌ unreadable",
    ]);
  });

  it("fails significance when the rules throw a non-error", () => {
    const thrown: unknown = "no rules at all";

    vi.mocked(significance.readReleaseRules).mockImplementation(() => {
      throw thrown;
    });

    expect(service.validate(context)[3]?.failures).toStrictEqual([
      "no rules at all",
    ]);
  });

  it("fails significance when the rules cannot be read", () => {
    vi.mocked(significance.readReleaseRules).mockImplementation(() => {
      throw new Error("no rules");
    });

    expect(service.validate(context)[3]?.failures).toStrictEqual(["no rules"]);
  });
});
