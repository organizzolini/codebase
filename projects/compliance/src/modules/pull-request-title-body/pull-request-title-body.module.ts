import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { PullRequestLabelsAssigneesModule } from "../pull-request-labels-assignees/pull-request-labels-assignees.module";

import { PullRequestTitleBodyCommand } from "./pull-request-title-body.command";

/** Provides pull-request context to workflow checks. */
@Module({
  controllers: [],
  exports: [PullRequestTitleBodyCommand],
  imports: [LoggerModule, PullRequestLabelsAssigneesModule],
  providers: [PullRequestTitleBodyCommand],
})
export class PullRequestTitleBodyModule {}
