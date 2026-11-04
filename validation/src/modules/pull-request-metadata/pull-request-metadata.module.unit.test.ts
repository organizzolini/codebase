import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { PullRequestMetadataGithubService } from "./pull-request-metadata-github.service";
import { PullRequestMetadataCommand } from "./pull-request-metadata.command";
import { PullRequestMetadataModule } from "./pull-request-metadata.module";
import { PullRequestMetadataService } from "./pull-request-metadata.service";

describe(PullRequestMetadataModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(PullRequestMetadataModule, LoggerModule);
    expectModuleProvides(
      PullRequestMetadataModule,
      PullRequestMetadataCommand,
      PullRequestMetadataGithubService,
      PullRequestMetadataService,
    );
  });
});
