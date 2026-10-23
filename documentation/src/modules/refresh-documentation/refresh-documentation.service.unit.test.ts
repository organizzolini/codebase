import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { RefreshDocumentationService } from "./refresh-documentation.service";

vi.mock("node:child_process", () => ({
  spawnSync: vi.fn<typeof spawnSync>(),
}));
vi.mock("node:fs", () => ({ rmSync: vi.fn<typeof rmSync>() }));

const spawnSyncMock = vi.mocked(spawnSync);
const rmSyncMock = vi.mocked(rmSync);

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

  it("runs OpenWiki in the working directory and removes its leftover file", () => {
    spawnSyncMock.mockReturnValue(completion({ status: 0 }));

    expect(service.refresh()).toBe(true);
    expect(spawnSyncMock).toHaveBeenCalledWith(
      "pnpm",
      ["exec", "openwiki", "code", "--update", "--print"],
      { cwd: process.cwd(), stdio: "inherit" },
    );
    expect(rmSyncMock).toHaveBeenCalledWith("CLAUDE.md", { force: true });
  });

  it("reports a failing exit status and still removes the leftover file", () => {
    spawnSyncMock.mockReturnValue(completion({ status: 1 }));

    expect(service.refresh()).toBe(false);
    expect(rmSyncMock).toHaveBeenCalledWith("CLAUDE.md", { force: true });
  });

  it("reports an executable that could not start", () => {
    spawnSyncMock.mockReturnValue(
      completion({ error: new Error("spawn pnpm ENOENT"), status: null }),
    );

    expect(service.refresh()).toBe(false);
  });
});
