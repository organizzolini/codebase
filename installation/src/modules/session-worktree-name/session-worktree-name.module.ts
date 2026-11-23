import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { SessionWorktreeNameGitService } from "./session-worktree-name-git.service";
import { SessionWorktreeNameCommand } from "./session-worktree-name.command";
import { SessionWorktreeNameService } from "./session-worktree-name.service";

/**
 * Provides the session-worktree-name command, which the worktree-name session
 * hook runs to judge the linked worktree it starts in.
 */
@Module({
  controllers: [],
  exports: [SessionWorktreeNameCommand, SessionWorktreeNameService],
  imports: [LoggerModule],
  providers: [
    SessionWorktreeNameCommand,
    SessionWorktreeNameGitService,
    SessionWorktreeNameService,
  ],
})
export class SessionWorktreeNameModule {}
