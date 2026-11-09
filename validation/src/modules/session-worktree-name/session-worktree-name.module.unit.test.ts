import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { SessionWorktreeNameGitService } from "./session-worktree-name-git.service";
import { SessionWorktreeNameCommand } from "./session-worktree-name.command";
import { SessionWorktreeNameModule } from "./session-worktree-name.module";
import { SessionWorktreeNameService } from "./session-worktree-name.service";

describe(SessionWorktreeNameModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(SessionWorktreeNameModule, LoggerModule);
    expectModuleProvides(
      SessionWorktreeNameModule,
      SessionWorktreeNameCommand,
      SessionWorktreeNameGitService,
      SessionWorktreeNameService,
    );
  });
});
