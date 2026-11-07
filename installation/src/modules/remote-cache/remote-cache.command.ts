import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { RemoteCacheService } from "./remote-cache.service";

/**
 * CLI command that gives this machine a read-only key to the shared Nx cache
 * bucket, so the local cache server reads through to it.
 *
 * Never exits non-zero for a missing or refusing `linode-cli`.
 */
@Command({
  description:
    "Create a read-only key to the shared Nx cache bucket and keep it in ~/.config/codebase/nx-shared-cache-remote.env",
  name: "remote-cache",
})
@Injectable()
export class RemoteCacheCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly remoteCacheService: RemoteCacheService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(RemoteCacheCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Sets up the remote cache key. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    this.remoteCacheService.setUpRemoteCache();
  }
}
