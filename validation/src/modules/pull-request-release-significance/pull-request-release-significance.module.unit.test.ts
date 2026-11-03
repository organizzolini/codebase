import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { PullRequestReleaseSignificanceGithubService } from "./pull-request-release-significance-github.service";
import { PullRequestReleaseSignificanceCommand } from "./pull-request-release-significance.command";
import { PullRequestReleaseSignificanceModule } from "./pull-request-release-significance.module";
import { PullRequestReleaseSignificanceService } from "./pull-request-release-significance.service";

describe(PullRequestReleaseSignificanceModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(PullRequestReleaseSignificanceModule, LoggerModule);
    expectModuleProvides(
      PullRequestReleaseSignificanceModule,
      PullRequestReleaseSignificanceCommand,
      PullRequestReleaseSignificanceGithubService,
      PullRequestReleaseSignificanceService,
    );
  });
});
