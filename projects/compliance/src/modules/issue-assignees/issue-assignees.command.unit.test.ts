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

import { IssueAssigneesGithubService } from "./issue-assignees-github.service";
import { IssueAssigneesCommand } from "./issue-assignees.command";

const githubServiceMock = createMock<IssueAssigneesGithubService>();

describe(IssueAssigneesCommand, () => {
  let command: IssueAssigneesCommand;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        IssueAssigneesCommand,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        {
          provide: IssueAssigneesGithubService,
          useValue: githubServiceMock,
        },
      ],
    }).compile();

    command = await module.resolve(IssueAssigneesCommand);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GITHUB_EVENT_NAME", "");
    vi.stubEnv("ISSUE_NUMBER", "");
    githubServiceMock.assignIssue.mockReturnValue({
      available: true,
      standardError: "",
      standardOutput: "",
      succeeded: true,
    });
    githubServiceMock.listUnassignedOpenIssueNumbers.mockReturnValue({
      issueNumbers: [17, 23],
      success: true,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        IssueAssigneesCommand,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        {
          provide: IssueAssigneesGithubService,
          useValue: githubServiceMock,
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("IssueAssigneesCommand");
  });

  it("enables the all-issues option", () => {
    expect(command.parseAllOption()).toBe(true);
  });

  it("assigns the issue supplied as a command argument", async () => {
    await command.run(["17"]);

    expect(githubServiceMock.assignIssue).toHaveBeenCalledWith("17");
  });

  it("assigns the issue supplied by a synthetic issues event", async () => {
    vi.stubEnv("GITHUB_EVENT_NAME", "issues");
    vi.stubEnv("ISSUE_NUMBER", "17");

    await command.run([], {});

    expect(githubServiceMock.assignIssue).toHaveBeenCalledWith("17");
    expect(
      githubServiceMock.listUnassignedOpenIssueNumbers,
    ).not.toHaveBeenCalled();
  });

  it.each(["schedule", "workflow_dispatch"])(
    "sweeps unassigned issues for a synthetic %s event",
    async (eventName) => {
      vi.stubEnv("GITHUB_EVENT_NAME", eventName);

      await command.run([], {});

      expect(
        githubServiceMock.listUnassignedOpenIssueNumbers,
      ).toHaveBeenCalledExactlyOnceWith();
      expect(githubServiceMock.assignIssue).toHaveBeenNthCalledWith(1, "17");
      expect(githubServiceMock.assignIssue).toHaveBeenNthCalledWith(2, "23");
    },
  );

  it.each(["--all", "-a"])(
    "sweeps issues with the %s argument",
    async (arg) => {
      await command.run([arg]);

      expect(
        githubServiceMock.listUnassignedOpenIssueNumbers,
      ).toHaveBeenCalledExactlyOnceWith();
    },
  );

  it("sweeps issues when the all option is enabled", async () => {
    await command.run([], { all: true });

    expect(
      githubServiceMock.listUnassignedOpenIssueNumbers,
    ).toHaveBeenCalledExactlyOnceWith();
  });

  it("reports an empty sweep without attempting assignments", async () => {
    githubServiceMock.listUnassignedOpenIssueNumbers.mockReturnValue({
      issueNumbers: [],
      success: true,
    });

    await command.run(["--all"]);

    expect(githubServiceMock.assignIssue).not.toHaveBeenCalled();
  });

  it("fails when GitHub cannot list open issues", async () => {
    githubServiceMock.listUnassignedOpenIssueNumbers.mockReturnValue({
      error: "authentication required",
      success: false,
    });
    mockProcessExit();

    await expect(command.run(["--all"])).rejects.toThrow("process.exit:1");
    expect(githubServiceMock.assignIssue).not.toHaveBeenCalled();
  });

  it("fails when GitHub cannot assign an issue", async () => {
    githubServiceMock.assignIssue.mockReturnValue({
      available: true,
      standardError: "permission denied",
      standardOutput: "",
      succeeded: false,
    });
    githubServiceMock.describeFailure.mockReturnValue("permission denied");
    mockProcessExit();

    await expect(command.run(["17"])).rejects.toThrow("process.exit:1");
  });

  it.each([["0"], ["not-an-issue"]])(
    "rejects an invalid issue number (%s)",
    async (issueNumber) => {
      mockProcessExit();

      await expect(command.run([issueNumber])).rejects.toThrow(
        "process.exit:1",
      );
      expect(githubServiceMock.assignIssue).not.toHaveBeenCalled();
    },
  );

  it("rejects multiple command arguments", async () => {
    mockProcessExit();

    await expect(command.run(["17", "23"])).rejects.toThrow("process.exit:1");
    expect(githubServiceMock.assignIssue).not.toHaveBeenCalled();
  });

  it("rejects a missing issue number when event inputs are absent", async () => {
    delete process.env["GITHUB_EVENT_NAME"];
    delete process.env["ISSUE_NUMBER"];
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(githubServiceMock.assignIssue).not.toHaveBeenCalled();
  });

  it("rejects an issue argument during a scheduled sweep", async () => {
    vi.stubEnv("GITHUB_EVENT_NAME", "schedule");
    mockProcessExit();

    await expect(command.run(["17"])).rejects.toThrow("process.exit:1");
    expect(
      githubServiceMock.listUnassignedOpenIssueNumbers,
    ).not.toHaveBeenCalled();
  });
});
