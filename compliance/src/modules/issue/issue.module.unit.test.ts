import { describe, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { IssueAssigningService } from "./issue-assigning.service";
import { IssueAuditService } from "./issue-audit.service";
import { IssueGithubService } from "./issue-github.service";
import { IssueLabelingService } from "./issue-labeling.service";
import { IssueLabelsService } from "./issue-labels.service";
import { IssueMetadataTypeService } from "./issue-metadata-type.service";
import { IssueMetadataService } from "./issue-metadata.service";
import { IssuePlanService } from "./issue-plan.service";
import { IssueReportService } from "./issue-report.service";
import { IssueCommand } from "./issue.command";
import { IssueModule } from "./issue.module";

describe(IssueModule, () => {
  it("imports the logger", () => {
    expectModuleImports(IssueModule, LoggerModule);
  });

  it("provides its command and every service behind it", () => {
    expectModuleProvides(
      IssueModule,
      IssueAssigningService,
      IssueAuditService,
      IssueCommand,
      IssueGithubService,
      IssueLabelingService,
      IssueLabelsService,
      IssueMetadataService,
      IssueMetadataTypeService,
      IssuePlanService,
      IssueReportService,
    );
  });

  it("exports its command and the metadata service", () => {
    expectModuleExports(IssueModule, IssueCommand, IssueMetadataService);
  });
});
