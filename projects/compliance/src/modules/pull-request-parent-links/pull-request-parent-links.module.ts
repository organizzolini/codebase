import { Module } from "@nestjs/common";

import { IssueMetadataModule } from "../issue-metadata/issue-metadata.module";
import { PullRequestLabelsAssigneesModule } from "../pull-request-labels-assignees/pull-request-labels-assignees.module";

import { PullRequestParentLinksCommand } from "./pull-request-parent-links.command";
import { PullRequestParentLinksService } from "./pull-request-parent-links.service";

/** Provides non-closing parent issue references for pull requests. */
@Module({
  controllers: [],
  exports: [PullRequestParentLinksCommand, PullRequestParentLinksService],
  imports: [IssueMetadataModule, PullRequestLabelsAssigneesModule],
  providers: [PullRequestParentLinksCommand, PullRequestParentLinksService],
})
export class PullRequestParentLinksModule {}
