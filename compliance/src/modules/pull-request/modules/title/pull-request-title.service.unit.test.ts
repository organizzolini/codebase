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

  it("passes a title that names three scopes", () => {
    vi.mocked(spawnSync).mockReturnValue(completion({ status: 0 }));

    expect(service.check("feat(a,b,c): ✨ add")).toStrictEqual([]);
  });

  it("fails a title that names four scopes, even when commitlint passes", () => {
    vi.mocked(spawnSync).mockReturnValue(completion({ status: 0 }));

    const [message] = service.check("feat(a,b,c,d): ✨ add");

    expect(message).toContain("4 scopes (a, b, c, d)");
  });

  it("counts a breaking-change title's scopes too", () => {
    vi.mocked(spawnSync).mockReturnValue(completion({ status: 0 }));

    expect(service.check("feat(a,b,c,d)!: ✨ add")).toHaveLength(1);
  });

  it("reports commitlint and the scope count together", () => {
    vi.mocked(spawnSync).mockReturnValue(
      completion({ status: 1, stdout: "too long" }),
    );

    expect(service.check("feat(a,b,c,d): ✨ add")).toHaveLength(2);
  });

  it("does not count a title with no scope", () => {
    vi.mocked(spawnSync).mockReturnValue(completion({ status: 0 }));

    expect(service.check("feat: ✨ add")).toStrictEqual([]);
  });
});
