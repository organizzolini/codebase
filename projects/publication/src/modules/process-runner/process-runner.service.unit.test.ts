import { spawnSync } from "node:child_process";

import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ProcessRunnerService } from "./process-runner.service";

import type { SpawnSyncReturns } from "node:child_process";

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

describe(ProcessRunnerService, () => {
  let service: ProcessRunnerService;

  /** Makes every `spawnSync` call complete as given. */
  const completeWith = (completion: SpawnCompletion): void => {
    const completed: SpawnSyncReturns<string> = {
      output: [],
      pid: 1,
      signal: null,
      status: completion.status === undefined ? 0 : completion.status,
      stderr: completion.stderr ?? "",
      stdout: completion.stdout ?? "",
      ...(completion.error === undefined ? {} : { error: completion.error }),
    };

    vi.mocked(spawnSync).mockReturnValue(completed);
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [ProcessRunnerService],
    }).compile();

    service = await module.resolve(ProcessRunnerService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  describe("capture", () => {
    it("returns both streams and the exit code", () => {
      expect.hasAssertions();

      completeWith({ status: 3, stderr: "warned", stdout: "printed" });

      expect(service.capture("git", ["status"])).toStrictEqual({
        status: 3,
        stderr: "warned",
        stdout: "printed",
      });
      expect(spawnSync).toHaveBeenCalledWith(
        "git",
        ["status"],
        expect.objectContaining({ encoding: "utf8" }),
      );
    });

    it("reports a process that never started as exit code 1", () => {
      expect.hasAssertions();

      completeWith({ error: new Error("spawn ENOENT"), status: null });

      expect(service.capture("missing", [])).toStrictEqual({
        status: 1,
        stderr: "Error: spawn ENOENT",
        stdout: "",
      });
    });
  });

  describe("stream", () => {
    it("inherits the output streams and returns the exit code", () => {
      expect.hasAssertions();

      completeWith({ status: 2 });

      expect(service.stream("pnpm", ["exec", "nx"])).toBe(2);
      expect(spawnSync).toHaveBeenCalledWith("pnpm", ["exec", "nx"], {
        stdio: ["inherit", "inherit", "inherit"],
      });
    });

    it("pipes the input to standard input", () => {
      expect.hasAssertions();

      completeWith({ status: 0 });

      expect(service.stream("pnpm", ["exec", "nx"], "a\nb\n")).toBe(0);
      expect(spawnSync).toHaveBeenCalledWith("pnpm", ["exec", "nx"], {
        input: "a\nb\n",
        stdio: ["pipe", "inherit", "inherit"],
      });
    });

    it("reports a signal death as exit code 1", () => {
      expect.hasAssertions();

      completeWith({ status: null });

      expect(service.stream("pnpm", [])).toBe(1);
    });
  });
});
