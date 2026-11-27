import { Injectable } from "@nestjs/common";

import { HELM_ROOT } from "../helm-releases/helm-releases.constants";
import { HelmReleasesService } from "../helm-releases/helm-releases.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { LINT_ARGUMENTS } from "./helm-lint.constants";

/** Runs `helm lint --strict` over every discovered Helm release. */
@Injectable()
export class HelmLintService {
  // 🏗 Dependency Injection

  constructor(
    private readonly helmReleases: HelmReleasesService,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Lints each release, stopping at the first that fails, and returns its status. */
  public lint(root = HELM_ROOT): number {
    for (const release of this.helmReleases.discover(root)) {
      const status = this.processRunner.stream("helm", [
        ...LINT_ARGUMENTS,
        ...this.helmReleases.chartArguments(root, release),
      ]);

      if (status !== 0) {
        return status;
      }
    }

    return 0;
  }
}
