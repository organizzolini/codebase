import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { IssueMetadataGithubService } from "./issue-metadata-github.service";
import { IssueMetadataTypeService } from "./issue-metadata-type.service";
import { IssueMetadataCommand } from "./issue-metadata.command";
import { IssueMetadataModule } from "./issue-metadata.module";
import { IssueMetadataService } from "./issue-metadata.service";

describe(IssueMetadataModule, () => {
  it("registers expected imports and providers", () => {
    expect.hasAssertions();

    expectModuleImports(IssueMetadataModule, LoggerModule);
    expectModuleProvides(
      IssueMetadataModule,
      IssueMetadataCommand,
      IssueMetadataGithubService,
      IssueMetadataService,
      IssueMetadataTypeService,
    );
  });
});
