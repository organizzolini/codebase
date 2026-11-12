import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { SessionBranchNameGitService } from "./session-branch-name-git.service";

describe(SessionBranchNameGitService, () => {
  let service: SessionBranchNameGitService;

  beforeAll(async () => {
    const built = await buildTestingModule(SessionBranchNameGitService);

    service = built.instance;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(SessionBranchNameGitService);

    expect(instance).toBeInstanceOf(SessionBranchNameGitService);
  });

  it("reports what git printed and the status it exited with", () => {
    const result = service.run(["--version"]);

    expect(result.available).toBe(true);
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/^git version /u);
  });

  it("reports a git that cannot start as unavailable, with no output", () => {
    vi.stubEnv("PATH", "");

    expect(service.run(["--version"])).toStrictEqual({
      available: false,
      status: null,
      stdout: "",
    });
  });
});
