import { describe, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

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
import { PullRequestReleaseSignificanceService } from "./modules/release-significance/pull-request-release-significance.service";
import { PullRequestTitleService } from "./modules/title/pull-request-title.service";
import { PullRequestReportService } from "./pull-request-report.service";
import { PullRequestValidationService } from "./pull-request-validation.service";
import { PullRequestCommand } from "./pull-request.command";
import { PullRequestModule } from "./pull-request.module";

describe(PullRequestModule, () => {
  it("imports the issue module and the logger", () => {
    expectModuleImports(PullRequestModule, IssueModule, LoggerModule);
  });

  it("provides its command and every service behind it", () => {
    expectModuleProvides(
      PullRequestModule,
      PullRequestAncestorIssuesService,
      PullRequestBodyLinksService,
      PullRequestBodyService,
      PullRequestCommand,
      PullRequestContextService,
      PullRequestDescendantIssuesService,
      PullRequestGithubService,
      PullRequestLabelVocabularyService,
      PullRequestLabelsAssigneesService,
      PullRequestLabelsService,
      PullRequestReleaseSignificanceService,
      PullRequestReportService,
      PullRequestTitleService,
      PullRequestValidationService,
    );
  });

  it("exports its command and the GitHub service", () => {
    expectModuleExports(
      PullRequestModule,
      PullRequestCommand,
      PullRequestGithubService,
    );
  });
});
