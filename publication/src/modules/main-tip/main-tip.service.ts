import fs from "node:fs";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import {
  requireSuccess,
  requireVariable,
} from "../process-runner/process-runner.utilities";

import { superseded, SUPERSEDED_LINE } from "./main-tip.constants";

import type { Environment } from "../../publication.types";

/**
 * Notices when `main` has moved during a release run, and steps the run aside.
 *
 * A release run takes long enough that another pull request often merges
 * while it works. That newer commit gets a release run of its own, which
 * releases everything this one would have, so a run that finds `main` has
 * moved steps aside instead of failing on a rejected push.
 */
@Injectable()
export class MainTipService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Reports whether the remote's `main` has moved off `base`.
   *
   * A failed fetch is not fatal: the comparison against `FETCH_HEAD` decides.
   */
  public hasMovedFrom(base: string): boolean {
    const fetched = this.processRunner.capture("git", [
      "fetch",
      "--quiet",
      "origin",
      "main",
    ]);

    if (fetched.status !== 0) {
      console.error(fetched.stderr.trim());
    }

    const tip = this.processRunner.capture("git", ["rev-parse", "FETCH_HEAD"]);

    return tip.stdout.trim() !== base;
  }

  /**
   * Prints the commit checked out.
   *
   * @returns Its full hash.
   */
  public head(): string {
    return requireSuccess(
      this.processRunner.capture("git", ["rev-parse", "HEAD"]),
      "git rev-parse HEAD",
    ).trim();
  }

  /**
   * Sets `RELEASE_SUPERSEDED=true`, which every later release step skips on, and says why.
   *
   * @param base - The commit this run started from.
   */
  public stepAsideFrom(base: string): void {
    const environmentFile = requireVariable(
      "GITHUB_ENV",
      this.configService.get("GITHUB_ENV", { infer: true }),
    );

    fs.appendFileSync(environmentFile, SUPERSEDED_LINE);
    const from = this.processRunner.capture("git", [
      "rev-parse",
      "--short",
      base,
    ]);
    const to = this.processRunner.capture("git", [
      "rev-parse",
      "--short",
      "FETCH_HEAD",
    ]);
    console.info(superseded(from.stdout.trim(), to.stdout.trim()));
  }
}
