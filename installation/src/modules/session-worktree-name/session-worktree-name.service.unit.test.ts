import { createMock } from "@golevelup/ts-vitest";
import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { SessionWorktreeNameGitService } from "./session-worktree-name-git.service";
import { SessionWorktreeNameService } from "./session-worktree-name.service";

const moduleOptions = {
  providers: [
    {
      provide: SessionWorktreeNameGitService,
      useValue: createMock<SessionWorktreeNameGitService>({
        run: () => ({ available: false, status: null, stdout: "" }),
      }),
    },
  ],
};

describe(SessionWorktreeNameService, () => {
  let service: SessionWorktreeNameService;

  beforeAll(async () => {
    const built = await buildTestingModule(
      SessionWorktreeNameService,
      moduleOptions,
    );

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      SessionWorktreeNameService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(SessionWorktreeNameService);
  });

  it("finds nothing to judge without git", () => {
    expect(service.findViolations()).toStrictEqual([]);
  });
});
