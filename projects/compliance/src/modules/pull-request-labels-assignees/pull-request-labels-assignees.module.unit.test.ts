import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { PullRequestLabelsAssigneesGithubService } from "./pull-request-labels-assignees-github.service";
import { PullRequestLabelsAssigneesCommand } from "./pull-request-labels-assignees.command";
import { PullRequestLabelsAssigneesModule } from "./pull-request-labels-assignees.module";
import { PullRequestLabelsAssigneesService } from "./pull-request-labels-assignees.service";

describe(PullRequestLabelsAssigneesModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    const imports = Reflect.getMetadata(
      "imports",
      PullRequestLabelsAssigneesModule,
    ) as undefined | unknown[];
    const providers = Reflect.getMetadata(
      "providers",
      PullRequestLabelsAssigneesModule,
    ) as undefined | unknown[];

    expect(imports).toContain(LoggerModule);
    expect(providers).toContain(PullRequestLabelsAssigneesCommand);
    expect(providers).toContain(PullRequestLabelsAssigneesGithubService);
    expect(providers).toContain(PullRequestLabelsAssigneesService);
  });
});
