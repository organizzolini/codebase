import { Injectable } from "@nestjs/common";

import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { SEMANTIC_RELEASE } from "./tag-codebase.constants";

/**
 * Versions and tags the codebase with semantic-release: the root version, the
 * root `CHANGELOG.md`, the `v*` tag and GitHub release the README badge shows,
 * and the one `chore(release): 🔖 tag codebase` commit that also carries the
 * package versions and changelogs `version-packages` wrote.
 *
 * It steps aside, as `MainTipService` describes, both before semantic-release
 * and after a failed one. Before matters because semantic-release, finding
 * `main` ahead of it, skips the release and exits 0, and `tag-packages` would
 * then commit the package versions on a stale commit. After matters because
 * semantic-release takes minutes before it pushes, and a merge in that window
 * gets the push rejected. Any other failure still fails.
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
   * Runs semantic-release, or steps aside when `main` has moved.
   *
   * The release commit and its push skip Husky's hooks. Every task in the
   * pre-commit hook only checks, and the merge queue already ran those checks
   * on this same content, so repeating them here only costs time: over 20
   * minutes for a release that bumps most of the packages, which outran the
   * job's timeout.
   *
   * @returns The exit code: 0 when released or stepped aside, 1 otherwise.
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
