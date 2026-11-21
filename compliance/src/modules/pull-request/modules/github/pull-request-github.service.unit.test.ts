import { spawnSync } from "node:child_process";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { GITHUB_CLI_BINARY } from "./pull-request-github.constants";
import { PullRequestGithubService } from "./pull-request-github.service";

import type * as Testing from "@codebase/testing";

vi.mock("node:child_process", async (importOriginal) => {
  const { mockChildProcess } =
    await vi.importActual<typeof Testing>("@codebase/testing");

  return mockChildProcess(await importOriginal());
});

/** What `spawnSync` hands back, as much of it as this service reads. */
interface SpawnCompletion {
  error?: Error;
  status?: null | number;
  stderr?: string;
  stdout?: string;
}

describe(PullRequestGithubService, () => {
  let service: PullRequestGithubService;

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
    const built = await buildTestingModule(PullRequestGithubService);

    service = built.instance;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(PullRequestGithubService);

    expect(instance).toBeInstanceOf(PullRequestGithubService);
  });

  describe("readList", () => {
    it("reads every page of a repo-scoped endpoint over REST", () => {
      expect.hasAssertions();

      completeWith({ stdout: "[[1,2],[3]]" });

      expect(service.readList("repos/{owner}/{repo}/labels")).toStrictEqual({
        available: true,
        standardError: "",
        standardOutput: "[1,2,3]",
        succeeded: true,
      });
      expect(spawnSync).toHaveBeenCalledWith(
        GITHUB_CLI_BINARY,
        ["api", "--paginate", "--slurp", "repos/{owner}/{repo}/labels"],
        { encoding: "utf8" },
      );
    });

    it("passes a failed read through untouched", () => {
      expect.hasAssertions();

      completeWith({ status: 1, stderr: "HTTP 403" });

      expect(service.readList("repos/{owner}/{repo}/labels")).toStrictEqual({
        available: true,
        standardError: "HTTP 403",
        standardOutput: "",
        succeeded: false,
      });
    });

    it("flattens nothing from a document that is not a list of pages", () => {
      expect.hasAssertions();

      completeWith({ stdout: '{"message":"nope"}' });

      expect(
        service.readList("repos/{owner}/{repo}/labels").standardOutput,
      ).toBe("[]");
    });

    it("skips a page that is not a list", () => {
      expect.hasAssertions();

      completeWith({ stdout: '[[1],"x",[2]]' });

      expect(
        service.readList("repos/{owner}/{repo}/labels").standardOutput,
      ).toBe("[1,2]");
    });

    it("reports output that is not JSON as a failed read", () => {
      expect.hasAssertions();

      completeWith({ stdout: "not json" });

      const result = service.readList("repos/{owner}/{repo}/labels");

      expect(result.succeeded).toBe(false);
      expect(result.standardError).toContain("JSON");
    });
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

    it("reports a non-zero exit as a failed call", () => {
      expect.hasAssertions();

      completeWith({ status: 1, stderr: "no such pull request" });

      expect(service.run(["pr", "view", "7"]).succeeded).toBe(false);
    });

    it("reports a missing binary as unavailable", () => {
      expect.hasAssertions();

      completeWith({ error: new Error("spawnSync gh ENOENT") });

      expect(service.run(["--version"])).toStrictEqual({
        available: false,
        standardError: "spawnSync gh ENOENT",
        standardOutput: "",
        succeeded: false,
      });
    });
  });

  describe("isAvailable", () => {
    it.each([
      ["true when gh runs", undefined, true],
      ["false when gh cannot be executed", new Error("ENOENT"), false],
    ])("is %s", (_description, error, expected) => {
      expect.hasAssertions();

      completeWith(error === undefined ? {} : { error });

      expect(service.isAvailable()).toBe(expected);
    });
  });

  describe("describeFailure", () => {
    it.each([
      [
        "both streams",
        "stderr line",
        "stdout line ",
        "stderr line stdout line",
      ],
      ["standard error alone", "stderr line", "", "stderr line"],
      ["standard output alone", "", "stdout line", "stdout line"],
      ["neither", "", "", "no output"],
    ])("reads %s", (_description, standardError, standardOutput, expected) => {
      expect.hasAssertions();
      expect(
        service.describeFailure({
          available: true,
          standardError,
          standardOutput,
          succeeded: false,
        }),
      ).toBe(expected);
    });
  });
});
