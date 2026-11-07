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
import { PullRequestGithubService } from "../pull-request/pull-request-github.service";

import { OrganizationProjectCommand } from "./organization-project.command";
import { ORGANIZATION_PROJECT_ITEM_LIMIT } from "./organization-project.constants";

import type { GithubCliResult } from "../pull-request/pull-request-github.types";

describe(OrganizationProjectCommand, () => {
  let command: OrganizationProjectCommand;
  let githubService: PullRequestGithubService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrganizationProjectCommand,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        {
          provide: PullRequestGithubService,
          useValue: createMock<PullRequestGithubService>(),
        },
      ],
    }).compile();

    command = await module.resolve(OrganizationProjectCommand);
    githubService = await module.resolve(PullRequestGithubService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(githubService.describeFailure).mockReturnValue("HTTP 403");
    vi.mocked(githubService.run).mockImplementation((arguments_) => {
      if (arguments_[0] === "issue") {
        return succeeded(
          JSON.stringify([
            { url: "https://github.com/organizzolini/codebase/issues/1" },
            { url: "https://github.com/organizzolini/codebase/issues/2" },
          ]),
        );
      }

      if (arguments_[0] === "pr") {
        return succeeded(
          JSON.stringify([
            { url: "https://github.com/organizzolini/codebase/pull/3" },
          ]),
        );
      }

      if (arguments_[1] === "item-list") {
        return succeeded(
          JSON.stringify({
            items: [
              {
                content: {
                  type: "Issue",
                  url: "https://github.com/organizzolini/codebase/issues/1",
                },
              },
              { content: { type: "DraftIssue" } },
              { content: null },
            ],
          }),
        );
      }

      return succeeded("");
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrganizationProjectCommand,
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
        {
          provide: PullRequestGithubService,
          useValue: createMock<PullRequestGithubService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith(
      "OrganizationProjectCommand",
    );
  });

  it("adds missing repository issues and pull requests to the organization project", async () => {
    await command.run([]);

    expect(githubService.run).toHaveBeenCalledWith([
      "issue",
      "list",
      "--repo",
      "organizzolini/codebase",
      "--state",
      "all",
      "--limit",
      "100000",
      "--json",
      "url",
    ]);
    expect(githubService.run).toHaveBeenCalledWith([
      "pr",
      "list",
      "--repo",
      "organizzolini/codebase",
      "--state",
      "all",
      "--limit",
      "100000",
      "--json",
      "url",
    ]);
    expect(githubService.run).toHaveBeenCalledWith([
      "project",
      "item-list",
      "1",
      "--owner",
      "organizzolini",
      "--limit",
      "100000",
      "--format",
      "json",
    ]);
    expect(githubService.run).toHaveBeenCalledWith([
      "project",
      "item-add",
      "1",
      "--owner",
      "organizzolini",
      "--url",
      "https://github.com/organizzolini/codebase/issues/2",
    ]);
    expect(githubService.run).toHaveBeenCalledWith([
      "project",
      "item-add",
      "1",
      "--owner",
      "organizzolini",
      "--url",
      "https://github.com/organizzolini/codebase/pull/3",
    ]);
    expect(
      vi
        .mocked(githubService.run)
        .mock.calls.filter(([arguments_]) => arguments_[1] === "item-add"),
    ).toHaveLength(2);
  });

  it("does not add resources already in the project", async () => {
    vi.mocked(githubService.run).mockImplementation((arguments_) => {
      if (arguments_[0] === "issue") {
        return succeeded(
          JSON.stringify([
            { url: "https://github.com/organizzolini/codebase/issues/1" },
          ]),
        );
      }

      if (arguments_[0] === "pr") {
        return succeeded("[]");
      }

      return succeeded(
        JSON.stringify({
          items: [
            {
              content: {
                type: "Issue",
                url: "https://github.com/organizzolini/codebase/issues/1",
              },
            },
          ],
        }),
      );
    });

    await command.run([]);

    expect(githubService.run).not.toHaveBeenCalledWith(
      expect.arrayContaining(["item-add"]),
    );
  });

  it("stops and reports when GitHub cannot list repository issues", async () => {
    vi.mocked(githubService.run).mockReturnValueOnce(
      failed("GitHub API unavailable"),
    );
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(githubService.run).toHaveBeenCalledTimes(1);
  });

  it("stops and reports when the repository resource limit is reached", async () => {
    vi.mocked(githubService.run).mockReturnValueOnce(
      succeeded(
        JSON.stringify(
          Array.from({ length: Number(ORGANIZATION_PROJECT_ITEM_LIMIT) }).fill({
            url: "https://github.com/organizzolini/codebase/issues/1",
          }),
        ),
      ),
    );
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(githubService.run).toHaveBeenCalledTimes(1);
  });

  it("stops and reports when the project item limit is reached", async () => {
    vi.mocked(githubService.run).mockImplementation((arguments_) => {
      if (arguments_[0] === "issue" || arguments_[0] === "pr") {
        return succeeded("[]");
      }

      const items = Array.from(
        { length: Number(ORGANIZATION_PROJECT_ITEM_LIMIT) },
        () => ({ content: { type: "DraftIssue" } }),
      );

      return succeeded(JSON.stringify({ items }));
    });
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(githubService.run).toHaveBeenCalledTimes(3);
  });

  it("stops and reports when GitHub returns invalid JSON", async () => {
    vi.mocked(githubService.run).mockReturnValueOnce(succeeded("{"));
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(githubService.run).toHaveBeenCalledTimes(1);
  });

  it("rejects unexpected arguments", async () => {
    mockProcessExit();

    await expect(command.run(["unexpected"])).rejects.toThrow("process.exit:1");
    expect(githubService.run).not.toHaveBeenCalled();
  });

  it("stops and reports when GitHub cannot add an item", async () => {
    vi.mocked(githubService.run).mockImplementation((arguments_) => {
      if (arguments_[0] === "issue") {
        return succeeded(
          JSON.stringify([
            { url: "https://github.com/organizzolini/codebase/issues/2" },
          ]),
        );
      }

      if (arguments_[0] === "pr") {
        return succeeded("[]");
      }

      if (arguments_[1] === "item-list") {
        return succeeded(JSON.stringify({ items: [] }));
      }

      return failed("Project write permission required");
    });
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
  });

  it("stops and reports when the project response is invalid", async () => {
    vi.mocked(githubService.run).mockImplementation((arguments_) => {
      if (arguments_[0] === "issue") {
        return succeeded("[]");
      }

      if (arguments_[0] === "pr") {
        return succeeded("[]");
      }

      return succeeded(JSON.stringify({ items: "invalid" }));
    });
    mockProcessExit();

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(githubService.run).toHaveBeenCalledTimes(3);
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
