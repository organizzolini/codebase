import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { PullRequestLabelsGithubService } from "./pull-request-labels-github.service";
import { PullRequestLabelsCommand } from "./pull-request-labels.command";
import { PullRequestLabelsService } from "./pull-request-labels.service";

/**
 * Provides the pull-request-labels compliance command.
 */
@Module({
  controllers: [],
  exports: [PullRequestLabelsCommand, PullRequestLabelsService],
  imports: [LoggerModule],
  providers: [
    PullRequestLabelsCommand,
    PullRequestLabelsGithubService,
    PullRequestLabelsService,
  ],
})
export class PullRequestLabelsModule {}
