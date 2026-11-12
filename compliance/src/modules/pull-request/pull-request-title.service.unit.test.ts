import { spawnSync } from "node:child_process";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { PullRequestTitleService } from "./pull-request-title.service";

import type * as Testing from "@codebase/testing";
import type { SpawnSyncReturns } from "node:child_process";

vi.mock("node:child_process", async (importOriginal) => {
  const { mockChildProcess } =
    await vi.importActual<typeof Testing>("@codebase/testing");

  return mockChildProcess(await importOriginal());
});

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
    const built = await buildTestingModule(PullRequestTitleService);

    service = built.instance;
  });

  beforeEach(() => {
    vi.mocked(spawnSync).mockReset();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(PullRequestTitleService);

    expect(instance).toBeInstanceOf(PullRequestTitleService);
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
