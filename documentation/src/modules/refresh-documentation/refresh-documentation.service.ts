import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import {
  OPENWIKI_ARGUMENTS,
  OPENWIKI_EXECUTABLE,
  OPENWIKI_LEFTOVER_FILE,
} from "./refresh-documentation.constants";

/**
 * Regenerates the OpenWiki pages under `documentation/openwiki`.
 *
 * Runs in the current working directory, which must be the workspace root:
 * the wiki is written through the root `openwiki` symlink.
 */
@Injectable()
export class RefreshDocumentationService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(RefreshDocumentationService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Updates the wiki from code, then deletes the instruction file OpenWiki
   * leaves behind — whether or not the update succeeded.
   *
   * @returns Whether OpenWiki started and exited with status zero.
   */
  public refresh(): boolean {
    this.logger.log("🧑‍🏫 Refreshing the OpenWiki documentation");

    const completion = spawnSync(OPENWIKI_EXECUTABLE, [...OPENWIKI_ARGUMENTS], {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    rmSync(OPENWIKI_LEFTOVER_FILE, { force: true });

    if (completion.error !== undefined || completion.status !== 0) {
      this.logger.error("❌ Failed refreshing the documentation with OpenWiki");
      return false;
    }

    return true;
  }
}
