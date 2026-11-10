import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { IssueAssigningService } from "./issue-assigning.service";
import { IssueGithubService } from "./issue-github.service";

import type { GithubCliResult } from "./issue-metadata.types";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";

const succeeded: GithubCliResult = {
  available: true,
  standardError: "",
  standardOutput: "",
  succeeded: true,
};
const failed: GithubCliResult = {
  available: true,
  standardError: "",
  standardOutput: "",
  succeeded: false,
};

/** What IssueAssigningService is built with. */
const DEPENDENCIES = {
  mocks: [IssueGithubService],
} satisfies TestingModuleOptions;

describe(IssueAssigningService, () => {
  let service: IssueAssigningService;
  let github: IssueGithubService;

  beforeAll(async () => {
    const built = await buildTestingModule(IssueAssigningService, DEPENDENCIES);

    service = built.instance;
    github = built.mock(IssueGithubService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.describeFailure).mockReturnValue("HTTP 403");
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      IssueAssigningService,
      DEPENDENCIES,
    );

    expect(instance).toBeInstanceOf(IssueAssigningService);
  });

  it("assigns one issue", () => {
    vi.mocked(github.assignIssue).mockReturnValue(succeeded);

    const outcome = service.assign("5");

    expect(outcome.failures).toStrictEqual([]);
    expect(outcome.lines[0]).toContain("Assigned issue 5");
  });

  it("reports an issue that cannot be assigned", () => {
    vi.mocked(github.assignIssue).mockReturnValue(failed);

    expect(service.assign("5").failures).toStrictEqual([
      expect.stringContaining("Unable to assign issue 5: HTTP 403"),
    ]);
  });

  it("reports when the listing fails", () => {
    vi.mocked(github.listUnassignedOpenIssueNumbers).mockReturnValue({
      error: "boom",
      success: false,
    });

    expect(service.assignAll().failures).toStrictEqual([
      "❌ Unable to list open issues: boom",
    ]);
  });

  it("says so when every issue is already assigned", () => {
    vi.mocked(github.listUnassignedOpenIssueNumbers).mockReturnValue({
      issueNumbers: [],
      success: true,
    });

    expect(service.assignAll().lines).toStrictEqual([
      "✅ No unassigned open issues found",
    ]);
  });

  it("assigns every unassigned issue and counts them", () => {
    vi.mocked(github.listUnassignedOpenIssueNumbers).mockReturnValue({
      issueNumbers: [1, 2],
      success: true,
    });
    vi.mocked(github.assignIssue).mockReturnValue(succeeded);

    const outcome = service.assignAll();

    expect(outcome.failures).toStrictEqual([]);
    expect(outcome.lines.at(-1)).toBe("✅ Assigned 2 unassigned open issue(s)");
  });
});
