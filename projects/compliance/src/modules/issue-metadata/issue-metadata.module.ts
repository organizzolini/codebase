import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { IssueMetadataGithubService } from "./issue-metadata-github.service";
import { IssueMetadataTypeService } from "./issue-metadata-type.service";
import { IssueMetadataCommand } from "./issue-metadata.command";
import { IssueMetadataService } from "./issue-metadata.service";

/** Provides the issue-metadata check command. */
@Module({
  controllers: [],
  exports: [IssueMetadataCommand, IssueMetadataService],
  imports: [LoggerModule],
  providers: [
    IssueMetadataCommand,
    IssueMetadataGithubService,
    IssueMetadataService,
    IssueMetadataTypeService,
  ],
})
export class IssueMetadataModule {}
