import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { WORKSPACE_ROOT } from "../helm-releases/helm-releases.constants";
import { HelmReleasesService } from "../helm-releases/helm-releases.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { requireSuccess } from "../process-runner/process-runner.utilities";

import { TEMPLATE_COMMAND } from "./helm-render.constants";

/** Templates every discovered Helm release into one file each. */
@Injectable()
export class HelmRenderService {
  // 🏗 Dependency Injection

  constructor(
    private readonly helmReleases: HelmReleasesService,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Templates each release into `<directory>/<release>.yaml`, failing on the first error. */
  public render(directory: string, root = WORKSPACE_ROOT): void {
    fs.mkdirSync(directory, { recursive: true });

    for (const release of this.helmReleases.discover(root)) {
      const args = [
        TEMPLATE_COMMAND,
        release.release,
        ...this.helmReleases.chartArguments(root, release),
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
