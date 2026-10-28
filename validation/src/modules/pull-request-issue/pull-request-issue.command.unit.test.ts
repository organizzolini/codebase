import { appendFileSync } from "node:fs";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { LoggerService } from "@codebase/observability";

import { mockProcessExit } from "../../../testing/mocks";

import { PullRequestIssueGithubService } from "./pull-request-issue-github.service";
import { PullRequestIssueCommand } from "./pull-request-issue.command";
import { STEP_SUMMARY_VARIABLE } from "./pull-request-issue.constants";
import { PullRequestIssueService } from "./pull-request-issue.service";

import type { GithubCliResult } from "./pull-request-issue.types";

vi.mock("node:fs", () => ({
  appendFileSync: vi.fn<(filePath: string, content: string) => void>(),
}));

/** A `gh` call that ran and worked, carrying this document. */
const succeeded = (standardOutput: string): GithubCliResult => ({
  available: true,
  standardError: "",
  standardOutput,
  succeeded: true,
});

/** A `gh` call that ran and failed, saying this. */
const failed = (standardError: string): GithubCliResult => ({
  available: true,
  standardError,
  standardOutput: "",
  succeeded: false,
});

/** A `gh pr view --json closingIssuesReferences` document. */
const pullRequestDocument = (issueNumbers: number[]): string =>
  JSON.stringify({
    closingIssuesReferences: issueNumbers.map((number) => ({ number })),
  });

describe(PullRequestIssueCommand, () => {
  let command: PullRequestIssueCommand;
  let githubService: PullRequestIssueGithubService;
  let reportLines: string[];

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PullRequestIssueCommand,
        PullRequestIssueService,
        {
          provide: PullRequestIssueGithubService,
          useValue: createMock<PullRequestIssueGithubService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(PullRequestIssueCommand);
    githubService = await module.resolve(PullRequestIssueGithubService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    Reflect.deleteProperty(process.env, "PULL_REQUEST_NUMBER");
    Reflect.deleteProperty(process.env, STEP_SUMMARY_VARIABLE);

    reportLines = [];
    vi.spyOn(console, "info").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
    vi.spyOn(console, "warn").mockImplementation((line: unknown): void => {
      reportLines.push(String(line));
    });
    vi.mocked(githubService.isAvailable).mockReturnValue(true);
    vi.mocked(githubService.describeFailure).mockImplementation(
      (result: GithubCliResult) =>
        result.standardError === "" ? "no output" : result.standardError,
    );
  });

  afterEach(() => {
    vi.mocked(appendFileSync).mockReset();
  });

  /** Runs the command and reports whether it exited non-zero. */
  const runCommand = async (
    passedParameters: string[] = [],
  ): Promise<boolean> => {
    const processExitSpy = mockProcessExit();

    try {
      await command.run(passedParameters);

      return false;
    } catch (error) {
      expect(error).toStrictEqual(new Error("process.exit:1"));

      return true;
    } finally {
      processExitSpy.mockRestore();
    }
  };

  it("is defined", () => {
    expect.hasAssertions();
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        PullRequestIssueCommand,
        PullRequestIssueService,
        {
          provide: PullRequestIssueGithubService,
          useValue: createMock<PullRequestIssueGithubService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("PullRequestIssueCommand");
  });

  it("passes and names the issues when the pull request links some", async () => {
    expect.hasAssertions();

    vi.mocked(githubService.run).mockReturnValue(
      succeeded(pullRequestDocument([12, 34])),
    );

    await expect(runCommand(["7"])).resolves.toBe(false);
    expect(githubService.run).toHaveBeenCalledWith([
      "pr",
      "view",
      "7",
      "--json",
      "closingIssuesReferences",
    ]);
    expect(reportLines.join("\n")).toContain("#12, #34");
  });

  it("fails and says how to link one when none is linked", async () => {
    expect.hasAssertions();

    vi.mocked(githubService.run).mockReturnValue(
      succeeded(pullRequestDocument([])),
    );

    await expect(runCommand(["7"])).resolves.toBe(true);
    expect(reportLines.join("\n")).toContain("closes or references no issue");
    expect(reportLines.join("\n")).toContain("Closes #<issue-number>");
  });

  it("reads the pull request number from the environment", async () => {
    expect.hasAssertions();

    process.env["PULL_REQUEST_NUMBER"] = "9";
    vi.mocked(githubService.run).mockReturnValue(
      succeeded(pullRequestDocument([1])),
    );

    await expect(runCommand()).resolves.toBe(false);
    expect(githubService.run).toHaveBeenCalledWith(
      expect.arrayContaining(["9"]),
    );
  });

  it("fails with usage when no pull request number is given", async () => {
    expect.hasAssertions();

    await expect(runCommand()).resolves.toBe(true);
    expect(reportLines.join("\n")).toContain("Expected a pull request number");
  });

  it("fails with usage on a non-numeric argument", async () => {
    expect.hasAssertions();

    await expect(runCommand(["abc"])).resolves.toBe(true);
    expect(reportLines.join("\n")).toContain("Not a pull request number: abc");
  });

  it("fails with usage on more than one argument", async () => {
    expect.hasAssertions();

    await expect(runCommand(["1", "2"])).resolves.toBe(true);
    expect(reportLines.join("\n")).toContain("at most one argument");
  });

  it("fails when gh is not available", async () => {
    expect.hasAssertions();

    vi.mocked(githubService.isAvailable).mockReturnValue(false);

    await expect(runCommand(["7"])).resolves.toBe(true);
    expect(reportLines.join("\n")).toContain("gh is not available");
  });

  it("fails when gh pr view fails", async () => {
    expect.hasAssertions();

    vi.mocked(githubService.run).mockReturnValue(failed("not found"));

    await expect(runCommand(["7"])).resolves.toBe(true);
    expect(reportLines.join("\n")).toContain("gh pr view failed (not found)");
  });

  it("fails when gh prints something that is not JSON", async () => {
    expect.hasAssertions();

    vi.mocked(githubService.run).mockReturnValue(succeeded("not json"));

    await expect(runCommand(["7"])).resolves.toBe(true);
    expect(reportLines.join("\n")).toContain("Unable to parse");
  });

  it("mirrors the report to the step summary when one is set", async () => {
    expect.hasAssertions();

    process.env[STEP_SUMMARY_VARIABLE] = "/tmp/summary.md";
    vi.mocked(githubService.run).mockReturnValue(
      succeeded(pullRequestDocument([5])),
    );

    await expect(runCommand(["7"])).resolves.toBe(false);
    expect(appendFileSync).toHaveBeenCalledWith(
      "/tmp/summary.md",
      expect.stringContaining("#5") as unknown,
      "utf8",
    );
  });

  it("warns instead of failing when the step summary cannot be written", async () => {
    expect.hasAssertions();

    process.env[STEP_SUMMARY_VARIABLE] = "/tmp/summary.md";
    vi.mocked(appendFileSync).mockImplementation(() => {
      throw new Error("disk full");
    });
    vi.mocked(githubService.run).mockReturnValue(
      succeeded(pullRequestDocument([5])),
    );

    await expect(runCommand(["7"])).resolves.toBe(false);
    expect(reportLines.join("\n")).toContain("Unable to write the report");
  });
});
