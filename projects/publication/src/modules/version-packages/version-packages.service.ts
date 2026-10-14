import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import {
  requireSuccess,
  requireVariable,
} from "../process-runner/process-runner.utilities";
import { TagPackagesService } from "../tag-packages/tag-packages.service";

import { authenticatedRemote, NX_RELEASE } from "./version-packages.constants";

import type { Environment } from "../../publication.types";

/**
 * Versions the ic-suite packages and writes their changelogs, leaving both
 * uncommitted for semantic-release's release commit.
 *
 * `nx release --skip-publish` reads each package's conventional commits,
 * writes the new versions, and prepends the release's entry to each bumped
 * package's `CHANGELOG.md`, which ships inside the package. nx.json's
 * `release.git` turns off Nx's own commit and tags: semantic-release commits
 * these files with the codebase's version, so a release lands on `main` as one
 * commit, and `tag-packages` tags that commit afterwards.
 *
 * Checkout persists no credentials, so the remote is pointed at the release
 * token first. It stays that way for the rest of the job, which is what lets
 * semantic-release and `tag-packages` push afterwards.
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

  // 🌎 Public Methods

  /**
   * Points the remote at the release token, pushes any tags an earlier run
   * left missing, and versions the release group.
   *
   * Nx reads each package's current version from its tag, so a version an
   * earlier run committed but never tagged reads as unreleased and is bumped
   * again; tagging first prevents that. A run `main` has already moved past
   * steps aside before versioning, which takes minutes.
   *
   * @returns The exit code: Nx's, or the tagging's when that failed, or 0
   * when the run stepped aside.
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

    return this.processRunner.stream("pnpm", NX_RELEASE);
  }
}
