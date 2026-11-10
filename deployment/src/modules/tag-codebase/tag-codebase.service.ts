import { Injectable } from "@nestjs/common";

import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { SEMANTIC_RELEASE } from "./tag-codebase.constants";

/**
 * Versions and tags the codebase with semantic-release, which makes the one
 * `chore(release)` commit carrying the package versions too.
 *
 * It steps aside when `main` moved, both before semantic-release, so no stale
 * commit is tagged, and after a failed one, since a merge during its
 * minutes-long run gets the push rejected. Other failures still fail.
 */
@Injectable()
export class TagCodebaseService {
  // 🏗 Dependency Injection

  constructor(
    private readonly mainTipService: MainTipService,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Runs semantic-release, or steps aside when `main` has moved. Skips Husky's
   * hooks, which only repeat checks the merge queue already ran.
   */
  public run(): number {
    const base = this.mainTipService.head();

    if (this.mainTipService.hasMovedFrom(base)) {
      this.mainTipService.stepAsideFrom(base);

      return 0;
    }

    if (this.processRunner.stream("env", SEMANTIC_RELEASE) === 0) {
      return 0;
    }

    if (this.mainTipService.hasMovedFrom(base)) {
      this.mainTipService.stepAsideFrom(base);

      return 0;
    }

    return 1;
  }
}
