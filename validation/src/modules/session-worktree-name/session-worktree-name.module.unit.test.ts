import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { SessionWorktreeNameGitService } from "./session-worktree-name-git.service";
import { SessionWorktreeNameCommand } from "./session-worktree-name.command";
import { SessionWorktreeNameModule } from "./session-worktree-name.module";
import { SessionWorktreeNameService } from "./session-worktree-name.service";

describe(SessionWorktreeNameModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata(
      "imports",
      SessionWorktreeNameModule,
    ) as undefined | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      SessionWorktreeNameModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(providers).toContain(SessionWorktreeNameCommand);
    expect(providers).toContain(SessionWorktreeNameGitService);
    expect(providers).toContain(SessionWorktreeNameService);
  });
});
