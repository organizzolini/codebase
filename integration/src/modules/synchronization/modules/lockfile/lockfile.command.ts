import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import {
  LOCKFILE_IN_SYNC_MESSAGE,
  LOCKFILE_OUT_OF_SYNC_MESSAGES,
  PACKAGE_MANAGER_MISSING_MESSAGE,
} from "./lockfile.constants";
import { LockfileService } from "./lockfile.service";

import type { SynchronizableCommand } from "../../synchronization.types";

/**
 * CLI command that checks `pnpm-lock.yaml` against the workspace manifests, by
 * pnpm's own `--frozen-lockfile` refusal.
 *
 * Exits 0 when the lockfile is in sync or pnpm cannot be found. Exits 1 only
 * when pnpm ran and refused.
 */
@Command({
  description:
    "Check that pnpm-lock.yaml is in sync with the workspace manifests",
  name: "lockfile",
})
@Injectable()
export class LockfileCommand
  extends CommandRunner
  implements SynchronizableCommand
{
  // 🏗 Dependency Injection

  constructor(
    private readonly lockfileService: LockfileService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(LockfileCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  readonly fixCommand = "pnpm install";

  readonly synchronizationLabel = "lockfile";

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Checks the lockfile and exits 0 or 1 on pnpm's verdict. */
  public async run(): Promise<void> {
    if (!(await this.synchronize())) {
      process.exit(1);
    }
  }

  /** Checks the lockfile and reports whether pnpm accepted it. Never writes. */
  public async synchronize(): Promise<boolean> {
    // Nothing here is asynchronous; the contract's signature is.
    await Promise.resolve();

    const result = this.lockfileService.checkLockfile();

    if (!result.available) {
      console.warn(PACKAGE_MANAGER_MISSING_MESSAGE);

      return true;
    }

    if (result.succeeded) {
      console.info(LOCKFILE_IN_SYNC_MESSAGE);

      return true;
    }

    for (const message of LOCKFILE_OUT_OF_SYNC_MESSAGES) {
      console.error(message);
    }

    console.error(result.output);

    return false;
  }
}
