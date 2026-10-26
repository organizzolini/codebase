import { spawnSync } from "node:child_process";
import {
  lstatSync,
  renameSync,
  rmSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";
import { setTimeout } from "node:timers/promises";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { RefreshDocumentationService } from "./refresh-documentation.service";

import type { Stats } from "node:fs";

vi.mock("node:child_process", () => ({
  spawnSync: vi.fn<typeof spawnSync>(),
}));
vi.mock("node:timers/promises", () => ({
  setTimeout: vi.fn<typeof setTimeout>(),
}));
vi.mock("node:fs", () => ({
  lstatSync: vi.fn<typeof lstatSync>(),
  renameSync: vi.fn<typeof renameSync>(),
  rmSync: vi.fn<typeof rmSync>(),
  symlinkSync: vi.fn<typeof symlinkSync>(),
  unlinkSync: vi.fn<typeof unlinkSync>(),
}));

const setTimeoutMock = vi.mocked(setTimeout);
const spawnSyncMock = vi.mocked(spawnSync);
const rmSyncMock = vi.mocked(rmSync);
const lstatSyncMock = vi.mocked(lstatSync);
const renameSyncMock = vi.mocked(renameSync);
const symlinkSyncMock = vi.mocked(symlinkSync);
const unlinkSyncMock = vi.mocked(unlinkSync);

/** A `spawnSync` result: what the service reads, and the rest empty. */
function completion(
  fields: Partial<ReturnType<typeof spawnSync>>,
): ReturnType<typeof spawnSync> {
  return {
    output: [],
    pid: 0,
    signal: null,
    status: 0,
    stderr: "",
    stdout: "",
    ...fields,
  };
}

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

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [RefreshDocumentationService],
    }).compile();

    service = await module.resolve(RefreshDocumentationService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("runs OpenWiki in the working directory and removes its leftover file", async () => {
    spawnSyncMock.mockReturnValue(completion({ status: 0 }));

    await expect(service.refresh()).resolves.toBe(true);
    expect(spawnSyncMock).toHaveBeenCalledWith(
      "pnpm",
      ["exec", "openwiki", "code", "--update", "--print"],
      { cwd: process.cwd(), stdio: "inherit" },
    );
    expect(rmSyncMock).toHaveBeenCalledWith("CLAUDE.md", { force: true });
  });

  it("reports a failing exit status and still removes the leftover file", async () => {
    spawnSyncMock.mockReturnValue(completion({ status: 1 }));

    await expect(service.refresh()).resolves.toBe(false);
    expect(spawnSyncMock).toHaveBeenCalledTimes(4);
    expect(setTimeoutMock.mock.calls).toStrictEqual([
      [120_000],
      [240_000],
      [360_000],
    ]);
    expect(rmSyncMock).toHaveBeenCalledWith("CLAUDE.md", { force: true });
  });

  it("starts OpenWiki again after a failure and stops once it succeeds", async () => {
    spawnSyncMock
      .mockReturnValueOnce(completion({ status: 1 }))
      .mockReturnValueOnce(completion({ status: 0 }));

    await expect(service.refresh()).resolves.toBe(true);
    expect(spawnSyncMock).toHaveBeenCalledTimes(2);
    expect(setTimeoutMock).toHaveBeenCalledExactlyOnceWith(120_000);
  });

  it("reports an executable that could not start", async () => {
    spawnSyncMock.mockReturnValue(
      completion({ error: new Error("spawn pnpm ENOENT"), status: null }),
    );

    await expect(service.refresh()).resolves.toBe(false);
  });

  describe("the root openwiki symlink", () => {
    it("swaps in the real directory for the run and puts the symlink back", async () => {
      expect.hasAssertions();

      reportEntry(true);
      spawnSyncMock.mockReturnValue(completion({ status: 0 }));

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
        spawnSyncMock.mock.invocationCallOrder[0] ?? 0,
      );
      expect(renameSyncMock.mock.invocationCallOrder[1]).toBeGreaterThan(
        spawnSyncMock.mock.invocationCallOrder[0] ?? 0,
      );
    });

    it("puts the symlink back when OpenWiki fails", async () => {
      expect.hasAssertions();

      reportEntry(true);
      spawnSyncMock.mockReturnValue(completion({ status: 1 }));

      await expect(service.refresh()).resolves.toBe(false);
      expect(symlinkSyncMock).toHaveBeenCalledTimes(1);
    });

    it("puts the symlink back when the run throws", async () => {
      expect.hasAssertions();

      reportEntry(true);
      spawnSyncMock.mockImplementation(() => {
        throw new Error("💥 spawn exploded");
      });

      await expect(service.refresh()).rejects.toThrow("💥 spawn exploded");
      expect(symlinkSyncMock).toHaveBeenCalledTimes(1);
      expect(rmSyncMock).toHaveBeenCalledWith("CLAUDE.md", { force: true });
    });

    it("leaves a real openwiki directory alone", async () => {
      expect.hasAssertions();

      reportEntry(false);
      spawnSyncMock.mockReturnValue(completion({ status: 0 }));

      await expect(service.refresh()).resolves.toBe(true);
      expect(unlinkSyncMock).not.toHaveBeenCalled();
      expect(renameSyncMock).not.toHaveBeenCalled();
      expect(symlinkSyncMock).not.toHaveBeenCalled();
    });

    it("leaves a missing openwiki entry alone", async () => {
      expect.hasAssertions();

      lstatSyncMock.mockReturnValue(undefined);
      spawnSyncMock.mockReturnValue(completion({ status: 0 }));

      await expect(service.refresh()).resolves.toBe(true);
      expect(renameSyncMock).not.toHaveBeenCalled();
    });
  });
});
