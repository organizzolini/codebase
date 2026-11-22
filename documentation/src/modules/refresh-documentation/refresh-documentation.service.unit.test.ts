import { ChildProcess, spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import {
  appendFileSync,
  lstatSync,
  renameSync,
  rmSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";
import { Readable } from "node:stream";
import { setTimeout } from "node:timers/promises";

import { createMock } from "@golevelup/ts-vitest";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { RefreshDocumentationService } from "./refresh-documentation.service";

import type * as Testing from "@codebase/testing";
import type * as FileSystemHelpers from "@codebase/testing/file-system";
import type { Stats } from "node:fs";

vi.mock("node:child_process", async (importOriginal) => {
  const { mockChildProcess } =
    await vi.importActual<typeof Testing>("@codebase/testing");

  return mockChildProcess(await importOriginal());
});
vi.mock("node:timers/promises", () => ({
  setTimeout: vi.fn<typeof setTimeout>(),
}));
vi.mock("node:fs", async () => {
  const { mockFileSystem } = await vi.importActual<typeof FileSystemHelpers>(
    "@codebase/testing/file-system",
  );

  return mockFileSystem();
});

const setTimeoutMock = vi.mocked(setTimeout);
const spawnMock = vi.mocked(spawn);
const spawnSyncMock = vi.mocked(spawnSync);
const appendFileSyncMock = vi.mocked(appendFileSync);
const rmSyncMock = vi.mocked(rmSync);
const lstatSyncMock = vi.mocked(lstatSync);
const renameSyncMock = vi.mocked(renameSync);
const symlinkSyncMock = vi.mocked(symlinkSync);
const unlinkSyncMock = vi.mocked(unlinkSync);

/** What a staged OpenWiki run prints and how it ends. */
interface StagedRun {
  error?: Error;
  status?: null | number;
  stderr?: string;
  stdout?: string;
}

/** Makes `git status` report the given porcelain listing. */
function stageGitStatus(stdout: string, status = 0): void {
  spawnSyncMock.mockReturnValue({
    output: [],
    pid: 0,
    signal: null,
    status,
    stderr: "",
    stdout,
  });
}

/** Makes the next `spawn` start an OpenWiki run that prints and ends as given. */
function stageRun({
  error,
  status = 0,
  stderr = "",
  stdout = "",
}: StagedRun = {}): void {
  const child = Object.assign(new ChildProcess(), {
    exitCode: status,
    stderr: Readable.from(stderr === "" ? [] : [Buffer.from(stderr)]),
    stdout: Readable.from(stdout === "" ? [] : [Buffer.from(stdout)]),
  });

  spawnMock.mockImplementationOnce(() => {
    void Promise.all([
      once(child.stdout, "end"),
      once(child.stderr, "end"),
    ]).then(() => {
      if (error === undefined) {
        child.emit("close", status);
      } else {
        child.emit("error", error);
      }
    });

    return child;
  });
}

/** Stages `count` runs that all end the same way. */
function stageRuns(count: number, run: StagedRun = {}): void {
  for (let index = 0; index < count; index++) {
    stageRun(run);
  }
}

const BOOKKEEPING_STATUS =
  " M documentation/openwiki/.last-update.json\n M documentation/openwiki/.page-manifest.json\n";

/** What `lstatSync` reports for the root `openwiki`: a symlink, or not. */
function reportEntry(isSymbolicLink: boolean): void {
  lstatSyncMock.mockReturnValue(
    createMock<Stats>({
      isSymbolicLink: () => isSymbolicLink,
    }),
  );
}

describe(RefreshDocumentationService, () => {
  let service: RefreshDocumentationService;
  let standardOutput: MockInstance<typeof process.stdout.write>;
  let standardError: MockInstance<typeof process.stderr.write>;

  beforeAll(async () => {
    const { module } = await buildTestingModule(RefreshDocumentationService);

    service = await module.resolve(RefreshDocumentationService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    spawnMock.mockReset();
    // GitHub Actions sets both, so a test that needs either states it.
    vi.stubEnv("GITHUB_OUTPUT", "");
    vi.stubEnv("GITHUB_STEP_SUMMARY", "");
    stageGitStatus("");
    standardOutput = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    standardError = vi.spyOn(process.stderr, "write").mockReturnValue(true);
  });

  afterEach(() => {
    standardOutput.mockRestore();
    standardError.mockRestore();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(RefreshDocumentationService);

    expect(instance).toBeInstanceOf(RefreshDocumentationService);
  });

  it("runs OpenWiki in the working directory and removes its leftover file", async () => {
    stageRun();

    await expect(service.refresh()).resolves.toBe(true);
    expect(spawnMock).toHaveBeenCalledWith(
      "pnpm",
      ["exec", "openwiki", "code", "--update", "--print"],
      { cwd: process.cwd(), stdio: ["inherit", "pipe", "pipe"] },
    );
    expect(rmSyncMock).toHaveBeenCalledWith("CLAUDE.md", { force: true });
  });

  it("relays what OpenWiki prints as it prints it", async () => {
    stageRun({ stderr: "a warning\n", stdout: "Planning repository wiki\n" });

    await service.refresh();

    expect(standardOutput).toHaveBeenCalledWith(
      Buffer.from("Planning repository wiki\n"),
    );
    expect(standardError).toHaveBeenCalledWith(Buffer.from("a warning\n"));
  });

  it("reports a failing exit status and still removes the leftover file", async () => {
    stageRuns(4, { status: 1 });

    await expect(service.refresh()).resolves.toBe(false);
    expect(spawnMock).toHaveBeenCalledTimes(4);
    expect(setTimeoutMock.mock.calls).toStrictEqual([
      [120_000],
      [240_000],
      [360_000],
    ]);
    expect(rmSyncMock).toHaveBeenCalledWith("CLAUDE.md", { force: true });
  });

  it("starts OpenWiki again after a failure and stops once it succeeds", async () => {
    stageRun({ status: 1 });
    stageRun({ status: 0 });

    await expect(service.refresh()).resolves.toBe(true);
    expect(spawnMock).toHaveBeenCalledTimes(2);
    expect(setTimeoutMock).toHaveBeenCalledExactlyOnceWith(120_000);
  });

  it("reports an executable that could not start", async () => {
    stageRuns(4, { error: new Error("spawn pnpm ENOENT") });

    await expect(service.refresh()).resolves.toBe(false);
    expect(standardError).toHaveBeenCalledWith("Error: spawn pnpm ENOENT\n");
  });

  describe("rate limits", () => {
    const now = Date.parse("2026-11-22T21:36:00.000Z");
    const resetting = (milliseconds: number): string =>
      `Rate limit exceeded | metadata: {"headers":{"X-RateLimit-Reset":"${String(now + milliseconds)}"}}\n`;

    beforeEach(() => {
      vi.useFakeTimers({ now, toFake: ["Date"] });
    });

    it("waits until a reset later than the growing wait, plus a margin", async () => {
      stageRun({ status: 1, stderr: resetting(400_000) });
      stageRun();

      await expect(service.refresh()).resolves.toBe(true);
      expect(setTimeoutMock).toHaveBeenCalledExactlyOnceWith(405_000);
    });

    it("never waits less than the growing wait for a reset that comes sooner", async () => {
      stageRun({ status: 1, stderr: resetting(10_000) });
      stageRun();

      await service.refresh();

      expect(setTimeoutMock).toHaveBeenCalledExactlyOnceWith(120_000);
    });

    it("stops retrying when the limit lifts beyond the patience limit", async () => {
      stageRun({ status: 1, stderr: resetting(3_600_000) });

      await expect(service.refresh()).resolves.toBe(false);
      expect(spawnMock).toHaveBeenCalledTimes(1);
      expect(setTimeoutMock).not.toHaveBeenCalled();
    });
  });

  describe("the job summary and step output", () => {
    it("lists every attempt in the job summary", async () => {
      expect.hasAssertions();

      vi.stubEnv("GITHUB_STEP_SUMMARY", "/runner/summary.md");
      stageRun({ status: 1, stderr: "Rate limit exceeded\n" });
      stageRun({ stdout: "Documenting page 1 of 1 · /a.md\n" });

      await service.refresh();

      expect(appendFileSyncMock).toHaveBeenCalledWith(
        "/runner/summary.md",
        expect.stringContaining("| 2 | ✅ Succeeded | 1 | — |"),
        "utf8",
      );
      expect(appendFileSyncMock).toHaveBeenCalledWith(
        "/runner/summary.md",
        expect.stringContaining("| 1 | ❌ Failed | 0 | — |"),
        "utf8",
      );
    });

    it("still writes the summary when every attempt fails, and no output", async () => {
      expect.hasAssertions();

      vi.stubEnv("GITHUB_STEP_SUMMARY", "/runner/summary.md");
      vi.stubEnv("GITHUB_OUTPUT", "/runner/output");
      stageRuns(4, { status: 1 });

      await service.refresh();

      expect(appendFileSyncMock).toHaveBeenCalledExactlyOnceWith(
        "/runner/summary.md",
        expect.stringContaining("No attempt succeeded."),
        "utf8",
      );
      expect(spawnSyncMock).not.toHaveBeenCalled();
    });

    it.each([
      ["a page changed", " M documentation/openwiki/quickstart.md\n", "true"],
      ["only bookkeeping changed", BOOKKEEPING_STATUS, "false"],
      ["nothing changed", "", "false"],
    ])("publishes wiki-changed when %s", async (_name, status, published) => {
      expect.hasAssertions();

      vi.stubEnv("GITHUB_OUTPUT", "/runner/output");
      stageRun();
      stageGitStatus(status);

      await service.refresh();

      expect(appendFileSyncMock).toHaveBeenCalledExactlyOnceWith(
        "/runner/output",
        `wiki-changed=${published}\n`,
        "utf8",
      );
      expect(spawnSyncMock).toHaveBeenCalledWith(
        "git",
        [
          "status",
          "--porcelain",
          "--untracked-files=all",
          "--",
          "documentation/openwiki",
          "AGENTS.md",
        ],
        { encoding: "utf8" },
      );
    });

    it("counts a status it cannot read as a change, so a pull request opens", async () => {
      expect.hasAssertions();

      vi.stubEnv("GITHUB_OUTPUT", "/runner/output");
      stageRun();
      stageGitStatus("", 128);

      await service.refresh();

      expect(appendFileSyncMock).toHaveBeenCalledWith(
        "/runner/output",
        "wiki-changed=true\n",
        "utf8",
      );
    });

    it("writes nothing outside GitHub Actions", async () => {
      expect.hasAssertions();

      vi.stubEnv("GITHUB_OUTPUT", undefined);
      stageRun();

      await service.refresh();

      expect(appendFileSyncMock).not.toHaveBeenCalled();
    });

    it("warns, and keeps its result, when a file cannot be written", async () => {
      expect.hasAssertions();

      vi.stubEnv("GITHUB_OUTPUT", "/runner/output");
      appendFileSyncMock.mockImplementation(() => {
        throw new Error("EACCES");
      });
      stageRun();

      await expect(service.refresh()).resolves.toBe(true);
      expect(standardError).toHaveBeenCalledWith(
        "⚠️ Unable to write to GITHUB_OUTPUT: Error: EACCES\n",
      );

      appendFileSyncMock.mockReset();
    });
  });

  describe("the root openwiki symlink", () => {
    it("swaps in the real directory for the run and puts the symlink back", async () => {
      expect.hasAssertions();

      reportEntry(true);
      stageRun();

      await expect(service.refresh()).resolves.toBe(true);
      expect(unlinkSyncMock).toHaveBeenCalledWith("openwiki");
      expect(renameSyncMock).toHaveBeenNthCalledWith(
        1,
        "documentation/openwiki",
        "openwiki",
      );
      expect(renameSyncMock).toHaveBeenNthCalledWith(
        2,
        "openwiki",
        "documentation/openwiki",
      );
      expect(symlinkSyncMock).toHaveBeenCalledWith(
        "documentation/openwiki",
        "openwiki",
      );
      expect(renameSyncMock.mock.invocationCallOrder[0]).toBeLessThan(
        spawnMock.mock.invocationCallOrder[0] ?? 0,
      );
      expect(renameSyncMock.mock.invocationCallOrder[1]).toBeGreaterThan(
        spawnMock.mock.invocationCallOrder[0] ?? 0,
      );
    });

    it("puts the symlink back before it checks what changed", async () => {
      expect.hasAssertions();

      reportEntry(true);
      stageRun();

      await service.refresh();

      expect(symlinkSyncMock.mock.invocationCallOrder[0]).toBeLessThan(
        spawnSyncMock.mock.invocationCallOrder[0] ?? 0,
      );
    });

    it("puts the symlink back when OpenWiki fails", async () => {
      expect.hasAssertions();

      reportEntry(true);
      stageRuns(4, { status: 1 });

      await expect(service.refresh()).resolves.toBe(false);
      expect(symlinkSyncMock).toHaveBeenCalledTimes(1);
    });

    it("puts the symlink back when the run throws", async () => {
      expect.hasAssertions();

      reportEntry(true);
      spawnMock.mockImplementation(() => {
        throw new Error("💥 spawn exploded");
      });

      await expect(service.refresh()).rejects.toThrow("💥 spawn exploded");
      expect(symlinkSyncMock).toHaveBeenCalledTimes(1);
      expect(rmSyncMock).toHaveBeenCalledWith("CLAUDE.md", { force: true });
    });

    it("leaves a real openwiki directory alone", async () => {
      expect.hasAssertions();

      reportEntry(false);
      stageRun();

      await expect(service.refresh()).resolves.toBe(true);
      expect(unlinkSyncMock).not.toHaveBeenCalled();
      expect(renameSyncMock).not.toHaveBeenCalled();
      expect(symlinkSyncMock).not.toHaveBeenCalled();
    });

    it("leaves a missing openwiki entry alone", async () => {
      expect.hasAssertions();

      lstatSyncMock.mockReturnValue(undefined);
      stageRun();

      await expect(service.refresh()).resolves.toBe(true);
      expect(renameSyncMock).not.toHaveBeenCalled();
    });
  });
});
