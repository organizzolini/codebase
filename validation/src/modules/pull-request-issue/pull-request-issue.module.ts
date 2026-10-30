import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { PullRequestIssueGithubService } from "./pull-request-issue-github.service";
import { PullRequestIssueCommand } from "./pull-request-issue.command";
import { PullRequestIssueService } from "./pull-request-issue.service";

/** Provides the pull-request-issue check command. */
@Module({
  controllers: [],
  exports: [PullRequestIssueCommand, PullRequestIssueService],
  imports: [LoggerModule],
  providers: [
    PullRequestIssueCommand,
    PullRequestIssueGithubService,
    PullRequestIssueService,
  ],
})
export class PullRequestIssueModule {}
