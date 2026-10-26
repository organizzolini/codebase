import fs from "node:fs";

import { Injectable } from "@nestjs/common";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import {
  APPLICATION_PYPROJECT,
  INSTALL_COMMAND,
  LOCK_COMMANDS,
  TEMPLATE_PYPROJECT,
  TOOLS_PYPROJECT,
  VERSION_PATTERN,
  VERSION_PROGRAM,
} from "./upgrade-python.constants";
import {
  currentVersion,
  withRequiredVersion,
  withToolVersions,
} from "./upgrade-python.utilities";

/**
 * Moves the Python version the workspace runs to the newest stable release.
 *
 * It never goes back: uv installs the newest stable Python it knows, and once
 * that was 3.14 on a repository already on 3.15. A release older than the one
 * in use changes nothing.
 */
@Injectable()
export class UpgradePythonService {
  // 🏗 Dependency Injection

  constructor(private readonly processRunner: ProcessRunnerService) {}

  // 🔐 Private Fields

  /** Orders versions by their numbers, so that 3.9 comes before 3.14. */
  private readonly collator = new Intl.Collator("en", { numeric: true });

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The `major.minor` of the newest stable Python, once uv has installed it. */
  private newest(): string {
    const [executable, ...args] = INSTALL_COMMAND;
    const install = this.processRunner.capture(executable, args);
    const probe = this.processRunner.capture("uv", [
      "run",
      "--no-project",
      "--python",
      "3",
      "python",
      "-c",
      VERSION_PROGRAM,
    ]);
    const version = probe.stdout.trim();

    if (install.status !== 0 || !VERSION_PATTERN.test(version)) {
      throw new Error(
        `uv did not report a Python version: ${install.stderr}${probe.stderr}${version}`.trim(),
      );
    }

    return version;
  }

  // 🌎 Public Methods

  /**
   * Moves every Python version setting to the newest stable release, then
   * locks again and syncs to prove the dependencies install on it.
   *
   * @returns The version now in use, as a summary line.
   * @throws When uv cannot report a version, or the lock or the sync fails.
   */
  public upgrade(): string {
    const latest = this.newest();
    const current = currentVersion(
      fs.readFileSync(APPLICATION_PYPROJECT, "utf8"),
    );

    if (this.collator.compare(latest, current) < 0) {
      return `Python ${current} (the newest uv installs is ${latest})`;
    }

    for (const file of [APPLICATION_PYPROJECT, TEMPLATE_PYPROJECT]) {
      const text = fs.readFileSync(file, "utf8");

      fs.writeFileSync(file, withRequiredVersion(text, latest));
    }

    const tools = fs.readFileSync(TOOLS_PYPROJECT, "utf8");

    fs.writeFileSync(TOOLS_PYPROJECT, withToolVersions(tools, latest));

    const locked = this.processRunner.captureSequence(LOCK_COMMANDS);

    if (locked.status !== 0) {
      throw new Error(
        `Python ${latest} does not lock and sync: ${locked.stderr}`,
      );
    }

    return `Python ${latest}`;
  }
}
