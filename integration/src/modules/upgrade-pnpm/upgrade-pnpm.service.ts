import { Injectable } from "@nestjs/common";

import { PackageManifestService } from "../package-manifest/package-manifest.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { VERSION_PATTERN } from "./upgrade-pnpm.constants";

/**
 * Moves the pnpm version the workspace pins to the newest release.
 *
 * pnpm's `minimumReleaseAge` refuses to switch to a release under a day old, so
 * the new pin is proven by asking pnpm for its version once it is written.
 */
@Injectable()
export class UpgradePnpmService {
  // 🏗 Dependency Injection

  constructor(
    private readonly packageManifest: PackageManifestService,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Pins the newest pnpm release.
   *
   * @returns The version now pinned, as a summary line.
   * @throws When the newest release cannot be found, or pnpm will not switch
   *   to it.
   */
  public upgrade(): string {
    const view = this.processRunner.capture("pnpm", [
      "view",
      "pnpm",
      "version",
    ]);
    const version = view.stdout.trim();

    if (view.status !== 0 || !VERSION_PATTERN.test(version)) {
      throw new Error(
        `pnpm view did not print a version: ${view.stderr || version}`.trim(),
      );
    }

    this.packageManifest.replace("packageManager", `pnpm@${version}`);

    const check = this.processRunner.capture("pnpm", ["--version"]);

    if (check.status !== 0) {
      throw new Error(`pnpm will not switch to ${version}: ${check.stderr}`);
    }

    return `pnpm ${version}`;
  }
}
