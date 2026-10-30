import { spawnSync } from "node:child_process";

import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { IssueAssigneesGithubService } from "./issue-assignees-github.service";

vi.mock("node:child_process", () => ({
  spawnSync: vi.fn<typeof spawnSync>(),
}));

/** One result from the `gh` process. */
const completion = (overrides: {
  error?: Error;
  status?: null | number;
  stderr?: string;
  stdout?: string;
}): ReturnType<typeof spawnSync> => ({
  output: [],
  pid: 1,
  signal: null,
  status: overrides.status === undefined ? 0 : overrides.status,
  stderr: overrides.stderr ?? "",
  stdout: overrides.stdout ?? "",
  ...(overrides.error === undefined ? {} : { error: overrides.error }),
});

describe(IssueAssigneesGithubService, () => {
  let service: IssueAssigneesGithubService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [IssueAssigneesGithubService],
    }).compile();

    service = await module.resolve(IssueAssigneesGithubService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  it("finds unassigned issues across every page and excludes pull requests", () => {
    const issues = [
      { assignees: [], number: 17, pull_request: null },
      {
        assignees: [{ login: "JimmyPaolini" }],
        number: 18,
        pull_request: null,
      },
      { assignees: [], number: 20 },
      {
        assignees: [],
        number: 19,
        pull_request: { url: "https://api.github.com/repos/a/b/pulls/19" },
      },
      { assignees: [], number: 23, pull_request: null },
    ];
    vi.mocked(spawnSync).mockReturnValue(
      completion({ stdout: JSON.stringify(issues) }),
    );

    expect(service.listUnassignedOpenIssueNumbers()).toStrictEqual({
      issueNumbers: [17, 20, 23],
      success: true,
    });
    expect(spawnSync).toHaveBeenCalledWith(
      "gh",
      [
        "api",
        "--paginate",
        "--slurp",
        "repos/{owner}/{repo}/issues?state=open&per_page=100",
        "--jq",
        "add | map({number, pull_request, assignees})",
      ],
      { encoding: "utf8" },
    );
  });

  it("returns GitHub CLI failures to the caller", () => {
    vi.mocked(spawnSync).mockReturnValue(
      completion({ status: 1, stderr: "authentication required" }),
    );

    expect(service.listUnassignedOpenIssueNumbers()).toStrictEqual({
      error: "authentication required",
      success: false,
    });
  });

  it("reports malformed GitHub JSON as a failed issue listing", () => {
    vi.mocked(spawnSync).mockReturnValue(completion({ stdout: "not-json" }));

    const result = service.listUnassignedOpenIssueNumbers();

    expect(result.success).toBe(false);
    expect(result.success ? undefined : result.error).toContain(
      "Unable to parse gh api output",
    );
  });

  it("reports invalid issue response data as a failed listing", () => {
    vi.mocked(spawnSync).mockReturnValue(
      completion({ stdout: JSON.stringify([{ assignees: [], number: 0 }]) }),
    );

    const result = service.listUnassignedOpenIssueNumbers();

    expect(result.success).toBe(false);
    expect(result.success ? undefined : result.error).toContain(
      "Unable to parse gh api output",
    );
  });

  it("describes both GitHub output streams", () => {
    expect(
      service.describeFailure({
        available: true,
        standardError: "request failed",
        standardOutput: "  check permissions  ",
        succeeded: false,
      }),
    ).toBe("request failed check permissions");
  });

  it("describes a GitHub failure without output", () => {
    expect(
      service.describeFailure({
        available: true,
        standardError: "",
        standardOutput: "",
        succeeded: false,
      }),
    ).toBe("no output");
  });

  it("assigns an issue to the repository owner", () => {
    vi.mocked(spawnSync).mockReturnValue(completion({}));

    expect(service.assignIssue("17")).toMatchObject({ succeeded: true });
    expect(spawnSync).toHaveBeenCalledWith(
      "gh",
      ["issue", "edit", "17", "--add-assignee", "JimmyPaolini"],
      { encoding: "utf8" },
    );
  });

  it("reports when the GitHub CLI cannot be started", () => {
    vi.mocked(spawnSync).mockReturnValue(
      completion({ error: new Error("gh not found") }),
    );

    expect(service.run(["issue", "view", "17"])).toStrictEqual({
      available: false,
      standardError: "gh not found",
      standardOutput: "",
      succeeded: false,
    });
  });

  it("treats a GitHub process without an exit status as unsuccessful", () => {
    vi.mocked(spawnSync).mockReturnValue(
      completion({ status: null, stderr: "interrupted" }),
    );

    expect(service.run(["issue", "view", "17"])).toStrictEqual({
      available: true,
      standardError: "interrupted",
      standardOutput: "",
      succeeded: false,
    });
  });
});
