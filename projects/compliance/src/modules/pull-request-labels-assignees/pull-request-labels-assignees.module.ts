import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { PullRequestLabelsAssigneesGithubService } from "./pull-request-labels-assignees-github.service";
import { PullRequestLabelsAssigneesCommand } from "./pull-request-labels-assignees.command";
import { PullRequestLabelsAssigneesService } from "./pull-request-labels-assignees.service";

/** Provides the pull-request-labels-assignees check command. */
@Module({
  controllers: [],
  exports: [
    PullRequestLabelsAssigneesCommand,
    PullRequestLabelsAssigneesGithubService,
    PullRequestLabelsAssigneesService,
  ],
  imports: [LoggerModule],
  providers: [
    PullRequestLabelsAssigneesCommand,
    PullRequestLabelsAssigneesGithubService,
    PullRequestLabelsAssigneesService,
  ],
})
export class PullRequestLabelsAssigneesModule {}
