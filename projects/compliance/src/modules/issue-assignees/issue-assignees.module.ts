import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { IssueAssigneesGithubService } from "./issue-assignees-github.service";
import { IssueAssigneesCommand } from "./issue-assignees.command";

/** Provides issue assignee reconciliation. */
@Module({
  controllers: [],
  exports: [IssueAssigneesCommand, IssueAssigneesGithubService],
  imports: [LoggerModule],
  providers: [IssueAssigneesCommand, IssueAssigneesGithubService],
})
export class IssueAssigneesModule {}
