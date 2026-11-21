import { describe, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { IssueReportService } from "./issue-report.service";
import { IssueCommand } from "./issue.command";
import { IssueModule } from "./issue.module";
import { IssueAssigningService } from "./modules/assignees/issue-assigning.service";
import { IssueAuditService } from "./modules/audit/issue-audit.service";
import { IssuePlanService } from "./modules/audit/issue-plan.service";
import { IssueGithubService } from "./modules/github/issue-github.service";
import { IssueLabelingService } from "./modules/labels/issue-labeling.service";
import { IssueLabelsService } from "./modules/labels/issue-labels.service";
import { IssueMetadataTypeService } from "./modules/metadata/issue-metadata-type.service";
import { IssueMetadataService } from "./modules/metadata/issue-metadata.service";

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
