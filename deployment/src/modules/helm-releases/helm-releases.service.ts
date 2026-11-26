import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { requireSuccess } from "../process-runner/process-runner.utilities";

import { HELM_ROOT } from "./helm-releases.constants";
import { discoverReleases } from "./helm-releases.utilities";

import type { HelmRelease } from "./helm-releases.types";

/**
 * Lints or renders every Helm release found under the charts folder, so each
 * tool judges exactly what Argo CD or a workflow installs.
 */
@Injectable()
export class HelmReleasesService {
  // 🏗 Dependency Injection

  constructor(private readonly processRunner: ProcessRunnerService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The chart, namespace, values, and string arguments both helm commands take. */
  private static chartArguments(root: string, release: HelmRelease): string[] {
    const chart = path.resolve(root, release.chart);

    return [
      chart,
      "--namespace",
      release.namespace,
      ...release.values.flatMap((file) => ["--values", path.join(chart, file)]),
      ...Object.entries(release.strings).flatMap(([key, value]) => [
        "--set-string",
        `${key}=${value}`,
      ]),
    ];
  }

  // 🌎 Public Methods

  /** Runs `helm lint --strict` on each release, stopping at the first that fails. */
  public lint(root = HELM_ROOT): number {
    for (const release of discoverReleases(root)) {
      const status = this.processRunner.stream("helm", [
        "lint",
        "--strict",
        ...HelmReleasesService.chartArguments(root, release),
      ]);

      if (status !== 0) {
        return status;
      }
    }

    return 0;
  }

  /** Templates each release into `<directory>/<release>.yaml`, failing on the first error. */
  public render(directory: string, root = HELM_ROOT): void {
    fs.mkdirSync(directory, { recursive: true });

    for (const release of discoverReleases(root)) {
      const args = [
        "template",
        release.release,
        ...HelmReleasesService.chartArguments(root, release),
      ];

      requireSuccess(
        this.processRunner.captureToFile(
          "helm",
          args,
          path.join(directory, `${release.release}.yaml`),
        ),
        `helm ${args.join(" ")}`,
      );
    }
  }
}
