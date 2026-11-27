import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { parseDocument } from "yaml";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import {
  IMAGE_REPOSITORY_PREFIX,
  invalidVersionMessage,
  NO_IMAGES_MESSAGE,
  VALUES_GLOB,
  VERSION_PATTERN,
} from "./release-images.constants";

import type { Environment } from "../../deployment.types";
import type { ReleaseImage } from "./release-images.types";

/**
 * Pushes every image the Helm values files name, then writes the release
 * version into them, so no release commit names a missing image.
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

  /** Reads the values files that set an image repository. */
  private readImages(): ReleaseImage[] {
    const images: ReleaseImage[] = [];

    for (const file of fs
      .globSync(VALUES_GLOB, { cwd: process.cwd() })
      .toSorted()) {
      const document = parseDocument(
        fs.readFileSync(path.join(process.cwd(), file), "utf8"),
      );
      const repository: unknown = document.getIn(["image", "repository"]);

      if (
        typeof repository === "string" &&
        repository.startsWith(IMAGE_REPOSITORY_PREFIX)
      ) {
        images.push({
          document,
          file,
          project: repository.slice(IMAGE_REPOSITORY_PREFIX.length),
        });
      }
    }

    return images;
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

  // 🌎 Public Methods

  /**
   * Pushes every image tagged with the version, then writes the tag.
   *
   * @param version - Release version.
   */
  public run(version: string): void {
    if (!VERSION_PATTERN.test(version)) {
      throw new Error(invalidVersionMessage(version));
    }

    const images = this.readImages();

    if (images.length === 0) {
      throw new Error(NO_IMAGES_MESSAGE);
    }

    const projects = images.map(({ project }) => project).toSorted();

    // One at a time and stopping at the first failure: a failed push writes no tag.
    this.stream("env", [
      `IMAGE_TAG=${version}`,
      "pnpm",
      "exec",
      "nx",
      "run-many",
      "--target=docker:push",
      `--projects=${projects.join(",")}`,
      "--parallel=1",
      "--nxBail",
    ]);

    for (const { document, file } of images) {
      document.setIn(["image", "tag"], version);
      fs.writeFileSync(
        path.join(process.cwd(), file),
        document.toString({ lineWidth: 0 }),
      );
    }
  }
}
