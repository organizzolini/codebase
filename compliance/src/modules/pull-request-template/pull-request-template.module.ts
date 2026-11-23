import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { PullRequestTemplateCommand } from "./pull-request-template.command";

/**
 * TODO: Document the pullRequestTemplate module.
 */
@Module({
  controllers: [],
  exports: [PullRequestTemplateCommand],
  imports: [LoggerModule],
  providers: [PullRequestTemplateCommand],
})
export class PullRequestTemplateModule {}
