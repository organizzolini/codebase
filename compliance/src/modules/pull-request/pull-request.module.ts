import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { IssueModule } from "../issue/issue.module";

import { PullRequestBodyLinksService } from "./modules/body/pull-request-body-links.service";
import { PullRequestBodyService } from "./modules/body/pull-request-body.service";
import { PullRequestContextService } from "./modules/context/pull-request-context.service";
import { PullRequestGithubService } from "./modules/github/pull-request-github.service";
import { PullRequestLabelVocabularyService } from "./modules/labels/pull-request-label-vocabulary.service";
import { PullRequestLabelsAssigneesService } from "./modules/labels/pull-request-labels-assignees.service";
import { PullRequestLabelsService } from "./modules/labels/pull-request-labels.service";
import { PullRequestAncestorIssuesService } from "./modules/linked-issues/pull-request-ancestor-issues.service";
import { PullRequestDescendantIssuesService } from "./modules/linked-issues/pull-request-descendant-issues.service";
import { PullRequestLinkedIssuesService } from "./modules/linked-issues/pull-request-linked-issues.service";
import { PullRequestReleaseSignificanceService } from "./modules/release-significance/pull-request-release-significance.service";
import { PullRequestTitleService } from "./modules/title/pull-request-title.service";
import { PullRequestReportService } from "./pull-request-report.service";
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
    PullRequestLinkedIssuesService,
    PullRequestAncestorIssuesService,
    PullRequestDescendantIssuesService,
    PullRequestBodyLinksService,
    PullRequestReleaseSignificanceService,
    PullRequestReportService,
    PullRequestTitleService,
    PullRequestValidationService,
  ],
})
export class PullRequestModule {}
