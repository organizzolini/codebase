import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { IssueReportService } from "./issue-report.service";
import { IssueCommand } from "./issue.command";
import { IssueAssigningService } from "./modules/assignees/issue-assigning.service";
import { IssueAuditService } from "./modules/audit/issue-audit.service";
import { IssuePlanService } from "./modules/audit/issue-plan.service";
import { IssueFieldsService } from "./modules/fields/issue-fields.service";
import { IssueGithubService } from "./modules/github/issue-github.service";
import { IssueLabelingService } from "./modules/labels/issue-labeling.service";
import { IssueLabelsService } from "./modules/labels/issue-labels.service";
import { IssueMetadataTypeService } from "./modules/metadata/issue-metadata-type.service";
import { IssueMetadataService } from "./modules/metadata/issue-metadata.service";

/** Provides the issue compliance command and the services behind it. */
@Module({
  controllers: [],
  exports: [IssueCommand, IssueFieldsService, IssueMetadataService],
  imports: [LoggerModule],
  providers: [
    IssueAssigningService,
    IssueAuditService,
    IssueCommand,
    IssueFieldsService,
    IssueGithubService,
    IssueLabelingService,
    IssueLabelsService,
    IssueMetadataService,
    IssueMetadataTypeService,
    IssuePlanService,
    IssueReportService,
  ],
})
export class IssueModule {}
