import fs from "node:fs";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import {
  boundingMessage,
  GITHUB_ENV_UNSET_MESSAGE,
  NO_PREVIOUS_TIP,
  noPreviousTipMessage,
  notAncestorMessage,
  REVISIONS_UNSET_MESSAGE,
} from "./bound-base-to-push.constants";

import type { Environment } from "../../publication.types";
import type { BoundBaseReport } from "./bound-base-to-push.types";

/**
 * Moves a push's `NX_BASE` to the push's own previous tip, `BEFORE`.
 *
 * On a push, `nx-set-shas` bases the run on the last commit whose whole
 * workflow succeeded. One red run on main then widens the next run to every
 * merge since, which runs longer, times out in turn, and widens the one after:
 * 19 of 40 main runs covered the whole workspace. Each commit reaching main
 * already passed the merge queue against main's tip, so no retry is needed.
 *
 * `NX_BASE` is kept when there is no previous tip (an empty or all-zero
 * `BEFORE`, as on a new branch) or when `BEFORE` is not an ancestor of
 * `NX_HEAD` (a force-push, or a commit this clone does not have).
 */
@Injectable()
export class BoundBaseToPushService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Reads one variable, an absent one as empty. */
  private read(name: "BEFORE" | "GITHUB_ENV" | "NX_BASE" | "NX_HEAD"): string {
    return this.configService.get(name, { infer: true }) ?? "";
  }

  // 🌎 Public Methods

  /**
   * Decides the push's base, and writes a moved one to `GITHUB_ENV` for the
   * later steps of the job.
   */
  public bound(): BoundBaseReport {
    const base = this.read("NX_BASE");
    const head = this.read("NX_HEAD");

    if (base === "" || head === "") {
      return { exitCode: 1, lines: [REVISIONS_UNSET_MESSAGE] };
    }

    const before = this.read("BEFORE");

    if (NO_PREVIOUS_TIP.test(before)) {
      return { exitCode: 0, lines: [noPreviousTipMessage(base)] };
    }

    const ancestry = this.processRunner.capture("git", [
      "merge-base",
      "--is-ancestor",
      before,
      head,
    ]);

    if (ancestry.status !== 0) {
      return { exitCode: 0, lines: [notAncestorMessage(before, head, base)] };
    }

    const bounding = boundingMessage(base, before);
    const githubEnvironment = this.read("GITHUB_ENV");

    if (githubEnvironment === "") {
      return { exitCode: 1, lines: [bounding, GITHUB_ENV_UNSET_MESSAGE] };
    }

    fs.appendFileSync(githubEnvironment, `NX_BASE=${before}\n`);

    return { exitCode: 0, lines: [bounding] };
  }
}
