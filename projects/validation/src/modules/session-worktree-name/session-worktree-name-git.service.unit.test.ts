import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { SessionWorktreeNameGitService } from "./session-worktree-name-git.service";

describe(SessionWorktreeNameGitService, () => {
  let service: SessionWorktreeNameGitService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [SessionWorktreeNameGitService],
    }).compile();

    service = await module.resolve(SessionWorktreeNameGitService);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
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
