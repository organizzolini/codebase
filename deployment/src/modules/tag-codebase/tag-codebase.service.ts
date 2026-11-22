import { Injectable } from "@nestjs/common";

import { MainTipService } from "../main-tip/main-tip.service";
import { SemanticReleaseService } from "../semantic-release/semantic-release.service";

import type { TagCodebaseOptions } from "./tag-codebase.types";

/**
 * Versions and tags the codebase with semantic-release, in one `chore(release)`
 * commit.
 *
 * Steps aside when `main` moved, before semantic-release so no stale commit is
 * tagged, and after a failed run, since a merge during it gets the push
 * rejected. Other failures still fail.
 */
@Injectable()
export class TagCodebaseService {
  // 🏗 Dependency Injection

  constructor(
    private readonly mainTipService: MainTipService,
    private readonly semanticReleaseService: SemanticReleaseService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Runs semantic-release, or steps aside when `main` has moved. A dry run only
   * previews, so it skips that check. Husky's hooks stay off.
   */
  public async run(options: TagCodebaseOptions = {}): Promise<number> {
    if (options.dryRun === true) {
      return (await this.semanticReleaseService.release({ dryRun: true }))
        ? 0
        : 1;
    }

    const base = this.mainTipService.head();

    if (this.mainTipService.hasMovedFrom(base)) {
      this.mainTipService.stepAsideFrom(base);

      return 0;
    }

    if (await this.semanticReleaseService.release()) {
      return 0;
    }

    if (this.mainTipService.hasMovedFrom(base)) {
      this.mainTipService.stepAsideFrom(base);

      return 0;
    }

    return 1;
  }
}
