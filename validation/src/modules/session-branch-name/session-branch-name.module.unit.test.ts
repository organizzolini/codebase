import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { SessionBranchNameGitService } from "./session-branch-name-git.service";
import { SessionBranchNameCommand } from "./session-branch-name.command";
import { SessionBranchNameModule } from "./session-branch-name.module";
import { SessionBranchNameService } from "./session-branch-name.service";

describe(SessionBranchNameModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(SessionBranchNameModule, LoggerModule);
    expectModuleProvides(
      SessionBranchNameModule,
      SessionBranchNameCommand,
      SessionBranchNameGitService,
      SessionBranchNameService,
    );
  });
});
