import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import {
  requireSuccess,
  requireVariable,
} from "../process-runner/process-runner.utilities";
import { TagPackagesService } from "../tag-packages/tag-packages.service";

import {
  authenticatedRemote,
  NX_RELEASE,
  NXIGNORE_FILE,
  RELEASE_NXIGNORE_ADDITION,
} from "./version-packages.constants";

import type { Environment } from "../../publication.types";

/**
 * Versions the ic-suite packages and writes their changelogs, leaving both
 * uncommitted for semantic-release's release commit.
 *
 * Nx's own commit and tags are off (`release.git`), so a release lands as one
 * commit. The `configuration` project is ignored for this run, so a
 * tooling-only change releases nothing. Points `origin` at the release token,
 * which later pushes keep.
 */
@Injectable()
export class VersionPackagesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly mainTipService: MainTipService,
    private readonly processRunner: ProcessRunnerService,
    private readonly tagPackagesService: TagPackagesService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Points `origin` at the release token, for this push and every later one. */
  private pointRemoteAtToken(): void {
    const token = requireVariable(
      "GITHUB_TOKEN",
      this.configService.get("GITHUB_TOKEN", { infer: true }),
    );
    const repository = requireVariable(
      "GITHUB_REPOSITORY",
      this.configService.get("GITHUB_REPOSITORY", { infer: true }),
    );

    requireSuccess(
      this.processRunner.capture("git", [
        "remote",
        "set-url",
        "origin",
        authenticatedRemote(token, repository),
      ]),
      "git remote set-url origin",
    );
  }

  /**
   * Runs `nx release` with the configuration project ignored, restoring
   * `.nxignore` however the run ends.
   */
  private releaseWithoutConfiguration(): number {
    const ignoreFile = path.join(process.cwd(), NXIGNORE_FILE);
    const original = fs.readFileSync(ignoreFile, "utf8");

    fs.writeFileSync(ignoreFile, `${original}${RELEASE_NXIGNORE_ADDITION}`);

    try {
      return this.processRunner.stream("env", NX_RELEASE);
    } finally {
      fs.writeFileSync(ignoreFile, original);
    }
  }

  // 🌎 Public Methods

  /**
   * Pushes missed tags before versioning, since Nx would otherwise bump an
   * untagged version again. Steps aside, returning 0, when `main` has moved.
   */
  public async run(): Promise<number> {
    this.pointRemoteAtToken();

    const base = this.mainTipService.head();

    if (this.mainTipService.hasMovedFrom(base)) {
      this.mainTipService.stepAsideFrom(base);

      return 0;
    }

    const tagged = await this.tagPackagesService.run();

    if (tagged !== 0) {
      return tagged;
    }

    return this.releaseWithoutConfiguration();
  }
}
