import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ReporterModule } from "../reporter/reporter.module";

import { SharedNxCacheRemoteService } from "./shared-nx-cache-remote.service";
import { SharedNxCacheServerService } from "./shared-nx-cache-server.service";
import { SharedNxCacheStorageService } from "./shared-nx-cache-storage.service";
import { SharedNxCacheCommand } from "./shared-nx-cache.command";

/**
 * Provides the command that serves a local Nx remote cache, shared by every
 * worktree on this machine, and the server and storage behind it.
 */
@Module({
  controllers: [],
  exports: [
    SharedNxCacheCommand,
    SharedNxCacheRemoteService,
    SharedNxCacheServerService,
    SharedNxCacheStorageService,
  ],
  imports: [LoggerModule, ReporterModule],
  providers: [
    SharedNxCacheCommand,
    SharedNxCacheRemoteService,
    SharedNxCacheServerService,
    SharedNxCacheStorageService,
  ],
})
export class SharedNxCacheModule {}
