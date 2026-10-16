import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { SessionWorktreeNameGitService } from "./session-worktree-name-git.service";
import { SessionWorktreeNameService } from "./session-worktree-name.service";

describe(SessionWorktreeNameService, () => {
  let service: SessionWorktreeNameService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SessionWorktreeNameService,
        {
          provide: SessionWorktreeNameGitService,
          useValue: createMock<SessionWorktreeNameGitService>({
            run: () => ({ available: false, status: null, stdout: "" }),
          }),
        },
      ],
    }).compile();

    service = await module.resolve(SessionWorktreeNameService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("finds nothing to judge without git", () => {
    expect(service.findViolations()).toStrictEqual([]);
  });
});
