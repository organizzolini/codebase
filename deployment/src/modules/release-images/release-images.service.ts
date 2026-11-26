import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { parseDocument } from "yaml";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { requireSuccess } from "../process-runner/process-runner.utilities";

import {
  IMAGE_TARGETS,
  imageMessage,
  invalidVersionMessage,
  projectNamesSchema,
  VERSION_PATTERN,
} from "./release-images.constants";

import type { Environment } from "../../deployment.types";
import type { ImageTarget } from "./release-images.types";

/**
 * Builds and pushes each Caelundas image that changed since the last release,
 * then writes its tag into the Helm values files the release commit carries.
 *
 * Only the tag fields change: the YAML is edited in place. An image is pushed before its tag is written, and a failed build or push
 * throws, so no release commit names an image that does not exist.
 */
@Injectable()
export class ReleaseImagesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Lists the projects Nx finds affected between the last release and HEAD. */
  private async affectedProjects(lastTag: string): Promise<string[]> {
    const listing = requireSuccess(
      await this.processRunner.captureAsync("pnpm", [
        "exec",
        "nx",
        "show",
        "projects",
        "--affected",
        "--json",
        `--base=${lastTag}`,
        "--head=HEAD",
      ]),
      "nx show projects --affected",
    );

    return projectNamesSchema.parse(JSON.parse(listing));
  }

  /** Runs a `docker-build` or `docker-push` target for a version. */
  private runTarget(target: string, project: string, version: string): void {
    this.stream("env", [
      `IMAGE_TAG=${version}`,
      "pnpm",
      "exec",
      "nx",
      "run",
      `${project}:${target}`,
    ]);
  }

  /** Runs a command with this process's output, throwing when it fails. */
  private stream(executable: string, args: readonly string[]): void {
    const commandLine = [executable, ...args].join(" ");

    if (this.configService.get("DRY_RUN") === "1") {
      console.info(`🌵 Dry run, would run: ${commandLine}`);

      return;
    }

    const status = this.processRunner.stream(executable, args);

    if (status !== 0) {
      throw new Error(`❌ ${commandLine} exited ${String(status)}`);
    }
  }

  /** Sets one tag field, keeping the file's comments and blank lines. */
  private writeTag(
    file: string,
    keys: readonly string[],
    version: string,
  ): void {
    const absolute = path.join(process.cwd(), file);
    const document = parseDocument(fs.readFileSync(absolute, "utf8"));

    document.setIn(keys, version);
    fs.writeFileSync(absolute, document.toString({ lineWidth: 0 }));
  }

  // 🌎 Public Methods

  /**
   * Releases every image that changed since `lastTag`, or all of them when
   * there is none, and writes their tags into the values files.
   *
   * @param version - The release version every rebuilt image is tagged with.
   * @param lastTag - The last release's git tag, or empty before the first.
   */
  public async run(version: string, lastTag: string): Promise<void> {
    if (!VERSION_PATTERN.test(version)) {
      throw new Error(invalidVersionMessage(version));
    }

    const affected =
      lastTag === "" ? undefined : await this.affectedProjects(lastTag);

    IMAGE_TARGETS.forEach((image: ImageTarget) => {
      const changed =
        affected === undefined || affected.includes(image.project);

      console.info(imageMessage(image.project, changed));

      if (!changed) {
        return;
      }

      this.runTarget("docker-build", image.project, version);
      this.runTarget("docker-push", image.project, version);

      image.fields.forEach(({ file, path: keys }) => {
        this.writeTag(file, keys, version);
      });
    });
  }
}
