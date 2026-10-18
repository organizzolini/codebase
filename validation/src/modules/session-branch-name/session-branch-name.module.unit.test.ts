import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { SessionBranchNameGitService } from "./session-branch-name-git.service";
import { SessionBranchNameCommand } from "./session-branch-name.command";
import { SessionBranchNameModule } from "./session-branch-name.module";
import { SessionBranchNameService } from "./session-branch-name.service";

describe(SessionBranchNameModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata("imports", SessionBranchNameModule) as
      | undefined
      | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      SessionBranchNameModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(providers).toContain(SessionBranchNameCommand);
    expect(providers).toContain(SessionBranchNameGitService);
    expect(providers).toContain(SessionBranchNameService);
  });
});
