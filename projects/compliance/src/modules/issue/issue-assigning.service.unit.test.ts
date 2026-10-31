import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { IssueAssigningService } from "./issue-assigning.service";
import { IssueGithubService } from "./issue-github.service";

import type { GithubCliResult } from "./issue-metadata.types";

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

describe(IssueAssigningService, () => {
  let service: IssueAssigningService;
  let github: IssueGithubService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        IssueAssigningService,
        {
          provide: IssueGithubService,
          useValue: createMock<IssueGithubService>(),
        },
      ],
    }).compile();

    service = await module.resolve(IssueAssigningService);
    github = await module.resolve(IssueGithubService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.describeFailure).mockReturnValue("HTTP 403");
  });

  it("is defined", () => {
    expect(service).toBeDefined();
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
