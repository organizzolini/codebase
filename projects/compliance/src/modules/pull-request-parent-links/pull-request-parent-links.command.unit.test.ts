import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
import { IssueMetadataTypeService } from "../issue-metadata/issue-metadata-type.service";
import { IssueMetadataService } from "../issue-metadata/issue-metadata.service";
import { PULL_REQUEST_BODY_FILE_VARIABLE } from "../pull-request-context/pull-request-context.constants";
import { PullRequestMetadataGithubService } from "../pull-request-metadata/pull-request-metadata-github.service";

import { PullRequestParentLinksCommand } from "./pull-request-parent-links.command";
import { PULL_REQUEST_NUMBER_VARIABLE } from "./pull-request-parent-links.constants";
import { PullRequestParentLinksService } from "./pull-request-parent-links.service";

import type { GithubCliResult } from "../pull-request-metadata/pull-request-metadata.types";

describe(PullRequestParentLinksCommand, () => {
  let command: PullRequestParentLinksCommand;
  let githubService: PullRequestMetadataGithubService;
  let parentLinksService: PullRequestParentLinksService;
  let bodyPath: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PullRequestParentLinksCommand,
        PullRequestParentLinksService,
        IssueMetadataService,
        IssueMetadataTypeService,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        {
          provide: PullRequestMetadataGithubService,
          useValue: createMock<PullRequestMetadataGithubService>(),
        },
      ],
    }).compile();

    command = await module.resolve(PullRequestParentLinksCommand);
    githubService = await module.resolve(PullRequestMetadataGithubService);
    parentLinksService = await module.resolve(PullRequestParentLinksService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    bodyPath = path.join(
      mkdtempSync(path.join(tmpdir(), "compliance-parent-links-")),
      "body.md",
    );
    writeFileSync(bodyPath, "## 🔗 Related\n\n- Closes #42\n", "utf8");
    vi.stubEnv(PULL_REQUEST_NUMBER_VARIABLE, "123");
    vi.stubEnv(PULL_REQUEST_BODY_FILE_VARIABLE, bodyPath);
    vi.mocked(githubService.describeFailure).mockReturnValue("HTTP 403");
    vi.mocked(githubService.run).mockImplementation((commandArguments) => {
      if (commandArguments[0] === "pr" && commandArguments[1] === "view") {
        return succeeded("[42,43]");
      }

      if (commandArguments[0] === "pr" && commandArguments[1] === "edit") {
        return succeeded("");
      }

      const issueNumber = Number(commandArguments[2]);
      const issues: Record<
        number,
        { body: string; parent: null | { number: number } }
      > = {
        3: { body: "", parent: null },
        7: { body: "Part of #3", parent: null },
        42: { body: "", parent: { number: 7 } },
        43: { body: "", parent: { number: 7 } },
      };

      return succeeded(JSON.stringify(issues[issueNumber]));
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    rmSync(path.dirname(bodyPath), { force: true, recursive: true });
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        PullRequestParentLinksCommand,
        PullRequestParentLinksService,
        IssueMetadataService,
        IssueMetadataTypeService,
        {
          provide: PullRequestMetadataGithubService,
          useValue: createMock<PullRequestMetadataGithubService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith(
      "PullRequestParentLinksCommand",
    );
  });

  it("adds each unique ancestor of linked issues to the PR body", async () => {
    await command.run([]);

    expect(readFileSync(bodyPath, "utf8")).toBe(
      "## 🔗 Related\n\n- Closes #42\n- Related to #7\n- Related to #3\n",
    );
    expect(vi.mocked(githubService.run)).toHaveBeenLastCalledWith([
      "pr",
      "edit",
      "123",
      "--body-file",
      bodyPath,
    ]);
  });

  it("does not edit the PR when its ancestors are already referenced", async () => {
    writeFileSync(
      bodyPath,
      "## 🔗 Related\n\n- Closes #42\n- Related to #7\n- Related to #3\n",
      "utf8",
    );

    await command.run([]);

    expect(vi.mocked(githubService.run)).not.toHaveBeenCalledWith(
      expect.arrayContaining(["pr", "edit"]),
    );
  });

  it("does not edit a pull request without a linked issue", async () => {
    vi.mocked(githubService.run).mockReturnValueOnce(succeeded("[]"));

    await command.run([]);

    expect(vi.mocked(githubService.run)).toHaveBeenCalledTimes(1);
    expect(readFileSync(bodyPath, "utf8")).toBe(
      "## 🔗 Related\n\n- Closes #42\n",
    );
  });

  it("does not require a Related section when linked issues have no parent", async () => {
    writeFileSync(bodyPath, "No parent issue", "utf8");
    vi.mocked(githubService.run)
      .mockReturnValueOnce(succeeded("[42]"))
      .mockReturnValueOnce(
        succeeded(JSON.stringify({ body: null, parent: null })),
      );

    await command.run([]);

    expect(readFileSync(bodyPath, "utf8")).toBe("No parent issue");
    expect(vi.mocked(githubService.run)).toHaveBeenCalledTimes(2);
  });

  it("does not add a direct linked issue to the Related list", async () => {
    vi.mocked(githubService.run)
      .mockReturnValueOnce(succeeded("[42,7]"))
      .mockReturnValueOnce(
        succeeded(JSON.stringify({ body: "", parent: { number: 7 } })),
      )
      .mockReturnValueOnce(
        succeeded(JSON.stringify({ body: "", parent: { number: 3 } })),
      )
      .mockReturnValueOnce(
        succeeded(JSON.stringify({ body: "", parent: null })),
      );

    await command.run([]);

    expect(readFileSync(bodyPath, "utf8")).toBe(
      "## 🔗 Related\n\n- Closes #42\n- Related to #3\n",
    );
  });

  it.each([
    ["malformed JSON", "{"],
    ["invalid linked issue data", "[0]"],
  ])("rejects %s from GitHub", async (_description, response) => {
    vi.mocked(githubService.run).mockReturnValueOnce(succeeded(response));
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
  });

  it("fails explicitly when linked issue data cannot be read", async () => {
    vi.mocked(githubService.run).mockReturnValueOnce(
      failed("GitHub API unavailable"),
    );
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(readFileSync(bodyPath, "utf8")).toBe(
      "## 🔗 Related\n\n- Closes #42\n",
    );
  });

  it("fails explicitly when linked issue parent data cannot be read", async () => {
    vi.mocked(githubService.run)
      .mockReturnValueOnce(succeeded("[42]"))
      .mockReturnValueOnce(failed("GitHub API unavailable"));
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
  });

  it.each([
    ["malformed JSON", "{"],
    ["invalid parent data", JSON.stringify({ body: 3, parent: null })],
  ])("rejects %s for a linked issue", async (_description, response) => {
    vi.mocked(githubService.run)
      .mockReturnValueOnce(succeeded("[42]"))
      .mockReturnValueOnce(succeeded(response));
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
  });

  it("fails explicitly when the pull request body cannot be read", async () => {
    rmSync(bodyPath);
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
  });

  it("fails explicitly when the body has no Related section", async () => {
    writeFileSync(bodyPath, "No Related section", "utf8");
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
  });

  it("fails explicitly when the body file cannot be updated", async () => {
    vi.spyOn(
      parentLinksService,
      "addRelatedIssueReferences",
    ).mockImplementation(() => {
      rmSync(path.dirname(bodyPath), { force: true, recursive: true });
      return "Updated body";
    });
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
  });

  it("fails explicitly when GitHub cannot update the pull request", async () => {
    vi.mocked(githubService.run).mockImplementation((commandArguments) => {
      if (commandArguments[0] === "pr" && commandArguments[1] === "edit") {
        return failed("GitHub API unavailable");
      }

      if (commandArguments[0] === "pr" && commandArguments[1] === "view") {
        return succeeded("[42]");
      }

      const issueNumber = Number(commandArguments[2]);
      const issues: Record<
        number,
        { body: string; parent: null | { number: number } }
      > = {
        3: { body: "", parent: null },
        7: { body: "Part of #3", parent: null },
        42: { body: "", parent: { number: 7 } },
      };

      return succeeded(JSON.stringify(issues[issueNumber]));
    });
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
  });

  it.each([
    ["unexpected arguments", async () => command.run(["123"])],
    [
      "invalid pull request number",
      async () => {
        vi.stubEnv(PULL_REQUEST_NUMBER_VARIABLE, "0");
        return command.run([]);
      },
    ],
    [
      "missing pull request number",
      async () => {
        vi.stubEnv(PULL_REQUEST_NUMBER_VARIABLE, undefined);
        return command.run([]);
      },
    ],
    [
      "missing body file",
      async () => {
        vi.stubEnv(PULL_REQUEST_BODY_FILE_VARIABLE, "");
        return command.run([]);
      },
    ],
    [
      "unset body file",
      async () => {
        vi.stubEnv(PULL_REQUEST_BODY_FILE_VARIABLE, undefined);
        return command.run([]);
      },
    ],
  ])("rejects %s", async (_description, run) => {
    mockProcessExit();

    await expect(run()).rejects.toThrow("process.exit:1");
    expect(githubService.run).not.toHaveBeenCalled();
  });

  it("fails rather than looping on a cyclic issue hierarchy", async () => {
    vi.mocked(githubService.run).mockImplementation((commandArguments) => {
      if (commandArguments[0] === "pr") {
        return succeeded("[42]");
      }

      const issueNumber = Number(commandArguments[2]);
      return succeeded(
        JSON.stringify({
          body: "",
          parent: { number: issueNumber === 42 ? 7 : 42 },
        }),
      );
    });
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(vi.mocked(githubService.run)).toHaveBeenCalledTimes(3);
  });

  function succeeded(standardOutput: string): GithubCliResult {
    return {
      available: true,
      standardError: "",
      standardOutput,
      succeeded: true,
    };
  }

  function failed(standardError: string): GithubCliResult {
    return {
      available: true,
      standardError,
      standardOutput: "",
      succeeded: false,
    };
  }
});
