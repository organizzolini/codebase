import { Module } from "@nestjs/common";

import { IssueMetadataModule } from "../issue-metadata/issue-metadata.module";
import { PullRequestMetadataModule } from "../pull-request-metadata/pull-request-metadata.module";

import { PullRequestParentLinksCommand } from "./pull-request-parent-links.command";
import { PullRequestParentLinksService } from "./pull-request-parent-links.service";

/** Provides non-closing parent issue references for pull requests. */
@Module({
  controllers: [],
  exports: [PullRequestParentLinksCommand, PullRequestParentLinksService],
  imports: [IssueMetadataModule, PullRequestMetadataModule],
  providers: [PullRequestParentLinksCommand, PullRequestParentLinksService],
})
export class PullRequestParentLinksModule {}
