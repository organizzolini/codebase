import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { PullRequestMetadataModule } from "../pull-request-metadata/pull-request-metadata.module";

import { PullRequestContextCommand } from "./pull-request-context.command";

/** Provides pull-request context to workflow checks. */
@Module({
  controllers: [],
  exports: [PullRequestContextCommand],
  imports: [LoggerModule, PullRequestMetadataModule],
  providers: [PullRequestContextCommand],
})
export class PullRequestContextModule {}
