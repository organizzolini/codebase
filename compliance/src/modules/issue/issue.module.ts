import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

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

/** Provides the issue compliance command and the services behind it. */
@Module({
  controllers: [],
  exports: [IssueCommand, IssueMetadataService],
  imports: [LoggerModule],
  providers: [
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
  ],
})
export class IssueModule {}
