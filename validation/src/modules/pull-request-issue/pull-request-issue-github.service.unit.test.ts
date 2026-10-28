import { spawnSync } from "node:child_process";

import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { PullRequestIssueGithubService } from "./pull-request-issue-github.service";
import { GITHUB_CLI_BINARY } from "./pull-request-issue.constants";

vi.mock("node:child_process", () => ({
  spawnSync: vi.fn<typeof spawnSync>(),
}));

/** What `spawnSync` hands back, as much of it as this service reads. */
interface SpawnCompletion {
  error?: Error;
  status?: null | number;
  stderr?: string;
  stdout?: string;
}

describe(PullRequestIssueGithubService, () => {
  let service: PullRequestIssueGithubService;

  /** Makes the next `spawnSync` call complete like this. */
  const completeWith = (completion: SpawnCompletion): void => {
    vi.mocked(spawnSync).mockReturnValue({
      output: [],
      pid: 1,
      signal: null,
      status: completion.status ?? 0,
      stderr: completion.stderr ?? "",
      stdout: completion.stdout ?? "",
      ...(completion.error === undefined ? {} : { error: completion.error }),
    });
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [PullRequestIssueGithubService],
    }).compile();

    service = await module.resolve(PullRequestIssueGithubService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  describe("run", () => {
    it("invokes gh with the arguments it was given", () => {
      expect.hasAssertions();

      completeWith({ stdout: "{}" });

      expect(service.run(["pr", "view", "7"])).toStrictEqual({
        available: true,
        standardError: "",
        standardOutput: "{}",
        succeeded: true,
      });
      expect(spawnSync).toHaveBeenCalledWith(
        GITHUB_CLI_BINARY,
        ["pr", "view", "7"],
        { encoding: "utf8" },
      );
    });

    it("keeps a notice on standard error out of the captured document", () => {
      expect.hasAssertions();

      completeWith({ stderr: "A new release of gh\n", stdout: '{"a":1}' });

      expect(service.run(["pr", "view", "7"])).toStrictEqual({
        available: true,
        standardError: "A new release of gh",
        standardOutput: '{"a":1}',
        succeeded: true,
      });
    });

    it("reports a non-zero exit as not succeeded", () => {
      expect.hasAssertions();

      completeWith({ status: 1, stderr: "not found" });

      expect(service.run(["pr", "view", "7"]).succeeded).toBe(false);
    });

    it("reports a missing binary as unavailable", () => {
      expect.hasAssertions();

      completeWith({ error: new Error("spawn gh ENOENT") });

      expect(service.run(["--version"])).toStrictEqual({
        available: false,
        standardError: "spawn gh ENOENT",
        standardOutput: "",
        succeeded: false,
      });
    });
  });

  describe("isAvailable", () => {
    it("is true when gh runs", () => {
      expect.hasAssertions();

      completeWith({ stdout: "gh version 2" });

      expect(service.isAvailable()).toBe(true);
    });

    it("is false when gh cannot be executed", () => {
      expect.hasAssertions();

      completeWith({ error: new Error("spawn gh ENOENT") });

      expect(service.isAvailable()).toBe(false);
    });
  });

  describe("describeFailure", () => {
    it("joins both streams", () => {
      expect.hasAssertions();

      expect(
        service.describeFailure({
          available: true,
          standardError: "bad",
          standardOutput: " out \n",
          succeeded: false,
        }),
      ).toBe("bad out");
    });

    it("says there was no output when both are empty", () => {
      expect.hasAssertions();

      expect(
        service.describeFailure({
          available: true,
          standardError: "",
          standardOutput: "",
          succeeded: false,
        }),
      ).toBe("no output");
    });
  });
});
