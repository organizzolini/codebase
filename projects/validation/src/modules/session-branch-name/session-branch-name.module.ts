import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { SessionBranchNameGitService } from "./session-branch-name-git.service";
import { SessionBranchNameCommand } from "./session-branch-name.command";
import { SessionBranchNameService } from "./session-branch-name.service";

/**
 * Provides the session-branch-name command, which the branch-name session
 * hook runs to judge the checked-out branch.
 */
@Module({
  controllers: [],
  exports: [SessionBranchNameCommand, SessionBranchNameService],
  imports: [LoggerModule],
  providers: [
    SessionBranchNameCommand,
    SessionBranchNameGitService,
    SessionBranchNameService,
  ],
})
export class SessionBranchNameModule {}
