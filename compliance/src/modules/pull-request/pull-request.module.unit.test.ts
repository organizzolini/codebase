import { describe, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { IssueModule } from "../issue/issue.module";

import { PullRequestAncestorIssuesService } from "./pull-request-ancestor-issues.service";
import { PullRequestBodyLinksService } from "./pull-request-body-links.service";
import { PullRequestBodyService } from "./pull-request-body.service";
import { PullRequestContextService } from "./pull-request-context.service";
import { PullRequestDescendantIssuesService } from "./pull-request-descendant-issues.service";
import { PullRequestGithubService } from "./pull-request-github.service";
import { PullRequestLabelVocabularyService } from "./pull-request-label-vocabulary.service";
import { PullRequestLabelsAssigneesService } from "./pull-request-labels-assignees.service";
import { PullRequestLabelsService } from "./pull-request-labels.service";
import { PullRequestReleaseSignificanceService } from "./pull-request-release-significance.service";
import { PullRequestReportService } from "./pull-request-report.service";
import { PullRequestTitleService } from "./pull-request-title.service";
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
