import { spawnSync } from "node:child_process";

import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { PullRequestTitleService } from "./pull-request-title.service";

import type { SpawnSyncReturns } from "node:child_process";

vi.mock("node:child_process", () => ({ spawnSync: vi.fn() }));

function completion(
  overrides: Partial<SpawnSyncReturns<string>>,
): SpawnSyncReturns<string> {
  return {
    output: [],
    pid: 1,
    signal: null,
    status: 0,
    stderr: "",
    stdout: "",
    ...overrides,
  };
}

describe(PullRequestTitleService, () => {
  let service: PullRequestTitleService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [PullRequestTitleService],
    }).compile();

    service = await module.resolve(PullRequestTitleService);
  });

  beforeEach(() => {
    vi.mocked(spawnSync).mockReset();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("passes a title commitlint accepts", () => {
    vi.mocked(spawnSync).mockReturnValue(completion({ status: 0 }));

    expect(service.check("feat: add")).toStrictEqual([]);
  });

  it("reports commitlint being unable to run", () => {
    vi.mocked(spawnSync).mockReturnValue(
      completion({ error: new Error("missing") }),
    );

    expect(service.check("feat: add")[0]).toContain("missing");
  });

  it("returns each non-empty commitlint line", () => {
    vi.mocked(spawnSync).mockReturnValue(
      completion({ status: 1, stderr: " second \n", stdout: "first\n\n" }),
    );

    expect(service.check("bad")).toStrictEqual(["first", "second"]);
  });

  it("falls back to a generic failure when commitlint says nothing", () => {
    vi.mocked(spawnSync).mockReturnValue(completion({ status: 1 }));

    expect(service.check("bad")[0]).toContain("Conventional Commits");
  });
});
