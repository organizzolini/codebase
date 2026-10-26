import { spawnSync } from "node:child_process";
import {
  lstatSync,
  renameSync,
  rmSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";
import { setTimeout } from "node:timers/promises";

import { Injectable } from "@nestjs/common";

import {
  OPENWIKI_ARGUMENTS,
  OPENWIKI_ATTEMPTS,
  OPENWIKI_EXECUTABLE,
  OPENWIKI_LEFTOVER_FILE,
  OPENWIKI_LINK,
  OPENWIKI_RETRY_DELAY_MS,
  OPENWIKI_STORAGE,
} from "./refresh-documentation.constants";

/**
 * Regenerates the OpenWiki pages under `documentation/openwiki`.
 *
 * Runs in the current working directory, which must be the workspace root:
 * OpenWiki treats that directory as the repository and writes to `openwiki`
 * beneath it. It refuses a symbolic link there, so for the length of a run the
 * root `openwiki` symlink gives way to the real directory it points at.
 */
@Injectable()
export class RefreshDocumentationService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Replaces the root `openwiki` symlink with the directory it points at.
   *
   * @returns Whether a symlink was replaced, and so must be put back.
   */
  private exposeWiki(): boolean {
    if (
      !lstatSync(OPENWIKI_LINK, { throwIfNoEntry: false })?.isSymbolicLink()
    ) {
      return false;
    }

    unlinkSync(OPENWIKI_LINK);
    renameSync(OPENWIKI_STORAGE, OPENWIKI_LINK);
    return true;
  }

  /** Moves the pages back to where they are committed and restores the symlink. */
  private restoreWiki(): void {
    renameSync(OPENWIKI_LINK, OPENWIKI_STORAGE);
    symlinkSync(OPENWIKI_STORAGE, OPENWIKI_LINK);
  }

  // 🌎 Public Methods

  /**
   * Updates the wiki from code, starting OpenWiki again after a growing wait
   * when it fails, then puts the `openwiki` symlink back and deletes the
   * instruction file OpenWiki leaves behind — whether or not it succeeded.
   *
   * @returns Whether OpenWiki started and exited with status zero.
   */
  public async refresh(): Promise<boolean> {
    const exposed = this.exposeWiki();

    try {
      for (let attempt = 1; attempt <= OPENWIKI_ATTEMPTS; attempt++) {
        const completion = spawnSync(
          OPENWIKI_EXECUTABLE,
          [...OPENWIKI_ARGUMENTS],
          { cwd: process.cwd(), stdio: "inherit" },
        );

        if (completion.error === undefined && completion.status === 0) {
          return true;
        }

        if (attempt < OPENWIKI_ATTEMPTS) {
          await setTimeout(attempt * OPENWIKI_RETRY_DELAY_MS);
        }
      }

      return false;
    } finally {
      if (exposed) {
        this.restoreWiki();
      }

      rmSync(OPENWIKI_LEFTOVER_FILE, { force: true });
    }
  }
}
