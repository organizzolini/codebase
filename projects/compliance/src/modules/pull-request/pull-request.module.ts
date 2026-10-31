import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { IssueModule } from "../issue/issue.module";

import { PullRequestBodyService } from "./pull-request-body.service";
import { PullRequestContextService } from "./pull-request-context.service";
import { PullRequestGithubService } from "./pull-request-github.service";
import { PullRequestLabelVocabularyService } from "./pull-request-label-vocabulary.service";
import { PullRequestLabelsAssigneesService } from "./pull-request-labels-assignees.service";
import { PullRequestLabelsService } from "./pull-request-labels.service";
import { PullRequestParentIssuesService } from "./pull-request-parent-issues.service";
import { PullRequestParentLinksService } from "./pull-request-parent-links.service";
import { PullRequestReleaseSignificanceService } from "./pull-request-release-significance.service";
import { PullRequestReportService } from "./pull-request-report.service";
import { PullRequestTitleService } from "./pull-request-title.service";
import { PullRequestValidationService } from "./pull-request-validation.service";
import { PullRequestCommand } from "./pull-request.command";

/** Provides the pull-request compliance command and the services behind it. */
@Module({
  controllers: [],
  exports: [PullRequestCommand, PullRequestGithubService],
  imports: [IssueModule, LoggerModule],
  providers: [
    PullRequestBodyService,
    PullRequestCommand,
    PullRequestContextService,
    PullRequestGithubService,
    PullRequestLabelsAssigneesService,
    PullRequestLabelsService,
    PullRequestLabelVocabularyService,
    PullRequestParentIssuesService,
    PullRequestParentLinksService,
    PullRequestReleaseSignificanceService,
    PullRequestReportService,
    PullRequestTitleService,
    PullRequestValidationService,
  ],
})
export class PullRequestModule {}
