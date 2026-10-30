import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

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
import { PullRequestMetadataGithubService } from "../pull-request-metadata/pull-request-metadata-github.service";

import { PullRequestContextCommand } from "./pull-request-context.command";

const githubServiceMock = createMock<PullRequestMetadataGithubService>();

describe(PullRequestContextCommand, () => {
  let command: PullRequestContextCommand;
  let outputDirectory: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PullRequestContextCommand,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        {
          provide: PullRequestMetadataGithubService,
          useValue: githubServiceMock,
        },
      ],
    }).compile();

    command = await module.resolve(PullRequestContextCommand);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    outputDirectory = mkdtempSync(path.join(tmpdir(), "compliance-context-"));
    vi.stubEnv("GITHUB_EVENT_NAME", "merge_group");
    vi.stubEnv("HEAD_REF", "gh-readonly-queue/main/pr-123-012345abcdef");
    vi.stubEnv("PULL_REQUEST_NUMBER", "");
    vi.stubEnv("GITHUB_OUTPUT", path.join(outputDirectory, "github-output"));
    vi.stubEnv(
      "PULL_REQUEST_TITLE_FILE",
      path.join(outputDirectory, "title.txt"),
    );
    vi.stubEnv("PULL_REQUEST_BODY_FILE", path.join(outputDirectory, "body.md"));
    githubServiceMock.describeFailure.mockReturnValue("HTTP 403");
    githubServiceMock.run.mockReturnValue({
      available: true,
      standardError: "",
      standardOutput: JSON.stringify({
        author: "dependabot[bot]",
        body: "A change",
        number: 123,
        title: "feat: add compliance",
      }),
      succeeded: true,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    rmSync(outputDirectory, { force: true, recursive: true });
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        PullRequestContextCommand,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        {
          provide: PullRequestMetadataGithubService,
          useValue: githubServiceMock,
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("PullRequestContextCommand");
  });

  it("resolves and writes pull request context from a synthetic merge-group ref", async () => {
    await command.run([]);

    expect(githubServiceMock.run).toHaveBeenCalledWith([
      "api",
      "repos/{owner}/{repo}/pulls/123",
      "--jq",
      "{number: .number, author: .user.login, title: .title, body: .body}",
    ]);
    expect(
      readFileSync(path.join(outputDirectory, "github-output"), "utf8"),
    ).toBe("pull-request-number=123\npull-request-author=dependabot[bot]\n");
    expect(readFileSync(path.join(outputDirectory, "title.txt"), "utf8")).toBe(
      "feat: add compliance",
    );
    expect(readFileSync(path.join(outputDirectory, "body.md"), "utf8")).toBe(
      "A change",
    );
  });

  it("resolves the pull request number from a synthetic pull-request event", async () => {
    vi.stubEnv("GITHUB_EVENT_NAME", "pull_request");
    vi.stubEnv("PULL_REQUEST_NUMBER", "123");

    await command.run([]);

    expect(githubServiceMock.run).toHaveBeenCalledWith([
      "api",
      "repos/{owner}/{repo}/pulls/123",
      "--jq",
      "{number: .number, author: .user.login, title: .title, body: .body}",
    ]);
  });

  it("writes an empty body when GitHub returns a null body", async () => {
    githubServiceMock.run.mockReturnValue({
      available: true,
      standardError: "",
      standardOutput: JSON.stringify({
        author: "JimmyPaolini",
        body: null,
        number: 123,
        title: "feat: add compliance",
      }),
      succeeded: true,
    });

    await command.run([]);

    expect(readFileSync(path.join(outputDirectory, "body.md"), "utf8")).toBe(
      "",
    );
  });

  it("rejects an invalid merge-group ref without querying GitHub", async () => {
    vi.stubEnv("HEAD_REF", "gh-readonly-queue/main/not-a-pull-request");
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");

    expect(githubServiceMock.run).not.toHaveBeenCalled();
  });

  it("rejects a merge-group event with no HEAD_REF", async () => {
    delete process.env["HEAD_REF"];
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(githubServiceMock.run).not.toHaveBeenCalled();
  });

  it("rejects a missing event name without querying GitHub", async () => {
    delete process.env["GITHUB_EVENT_NAME"];
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(githubServiceMock.run).not.toHaveBeenCalled();
  });

  it("rejects unsupported events without querying GitHub", async () => {
    vi.stubEnv("GITHUB_EVENT_NAME", "schedule");
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");

    expect(githubServiceMock.run).not.toHaveBeenCalled();
  });

  it("rejects a non-positive pull request number", async () => {
    vi.stubEnv("GITHUB_EVENT_NAME", "pull_request");
    vi.stubEnv("PULL_REQUEST_NUMBER", "0");
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(githubServiceMock.run).not.toHaveBeenCalled();
  });

  it("rejects a pull request event without a pull request number", async () => {
    vi.stubEnv("GITHUB_EVENT_NAME", "pull_request");
    delete process.env["PULL_REQUEST_NUMBER"];
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(githubServiceMock.run).not.toHaveBeenCalled();
  });

  it("rejects a pull request number that differs from GitHub's response", async () => {
    githubServiceMock.run.mockReturnValue({
      available: true,
      standardError: "",
      standardOutput: JSON.stringify({
        author: "JimmyPaolini",
        body: "A change",
        number: 124,
        title: "feat: add compliance",
      }),
      succeeded: true,
    });
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(existsSync(path.join(outputDirectory, "github-output"))).toBe(false);
  });

  it("rejects an author that could inject a workflow output", async () => {
    githubServiceMock.run.mockReturnValue({
      available: true,
      standardError: "",
      standardOutput: JSON.stringify({
        author: "JimmyPaolini\nmalicious=value",
        body: "A change",
        number: 123,
        title: "feat: add compliance",
      }),
      succeeded: true,
    });
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(existsSync(path.join(outputDirectory, "github-output"))).toBe(false);
  });

  it("rejects command arguments", async () => {
    mockProcessExit();

    await expect(command.run(["123"])).rejects.toThrow("process.exit:1");
    expect(githubServiceMock.run).not.toHaveBeenCalled();
  });

  it("reports GitHub CLI failures", async () => {
    githubServiceMock.run.mockReturnValue({
      available: true,
      standardError: "Not Found",
      standardOutput: "",
      succeeded: false,
    });
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");

    expect(githubServiceMock.describeFailure).toHaveBeenCalledWith({
      available: true,
      standardError: "Not Found",
      standardOutput: "",
      succeeded: false,
    });
  });

  it("reports malformed GitHub JSON", async () => {
    githubServiceMock.run.mockReturnValue({
      available: true,
      standardError: "",
      standardOutput: "not-json",
      succeeded: true,
    });
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
  });

  it.each([
    "GITHUB_OUTPUT",
    "PULL_REQUEST_TITLE_FILE",
    "PULL_REQUEST_BODY_FILE",
  ])("requires the %s workflow path", async (variable) => {
    vi.stubEnv(variable, "");
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
  });

  it.each([
    "GITHUB_OUTPUT",
    "PULL_REQUEST_TITLE_FILE",
    "PULL_REQUEST_BODY_FILE",
  ])("rejects an unset %s workflow path", async (variable) => {
    vi.stubEnv(variable, undefined);
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
  });

  it("reports failures writing pull request context", async () => {
    vi.stubEnv(
      "PULL_REQUEST_TITLE_FILE",
      path.join(outputDirectory, "missing", "title.txt"),
    );
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
  });
});
