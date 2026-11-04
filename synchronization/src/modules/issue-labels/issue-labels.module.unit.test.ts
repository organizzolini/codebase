import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { IssueLabelsGithubService } from "./issue-labels-github.service";
import { IssueLabelsCommand } from "./issue-labels.command";
import { IssueLabelsModule } from "./issue-labels.module";
import { IssueLabelsService } from "./issue-labels.service";

describe(IssueLabelsModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(IssueLabelsModule, LoggerModule);
    expectModuleProvides(
      IssueLabelsModule,
      IssueLabelsCommand,
      IssueLabelsGithubService,
      IssueLabelsService,
    );
  });
});
