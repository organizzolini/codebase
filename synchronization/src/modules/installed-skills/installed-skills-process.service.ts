import { spawnSync } from "node:child_process";

import { Injectable } from "@nestjs/common";

import type { ProcessCommand, ProcessResult } from "./installed-skills.types";

/**
 * Runs `git`, `pnpm`, and `skills` in the workspace root.
 *
 * The one place this module starts a process, so its tests can fake every
 * one of them while the rest runs for real over a workspace on disk.
 */
@Injectable()
export class InstalledSkillsProcessService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Runs one process to completion in the current working directory.
   *
   * @param command - The executable, its arguments, and whether it prints.
   * @returns Whether it could start, and the status it exited with.
   */
  public run(command: ProcessCommand): ProcessResult {
    const completion = spawnSync(command.executable, [...command.args], {
      cwd: process.cwd(),
      stdio: command.streamOutput ? "inherit" : "ignore",
    });

    return {
      available: completion.error === undefined,
      status: completion.status,
    };
  }
}
