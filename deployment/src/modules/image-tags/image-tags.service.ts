import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { parseDocument } from "yaml";

import {
  IMAGE_REPOSITORY_PREFIX,
  invalidVersionMessage,
  NO_IMAGES_MESSAGE,
  VALUES_GLOB,
  VERSION_PATTERN,
} from "./image-tags.constants";

import type { Environment } from "../../deployment.types";
import type { ImageValues } from "./image-tags.types";

/** Writes a release's version as the image tag of every Helm values file that names one of this repository's images. */
@Injectable()
export class ImageTagsService {
  // 🏗 Dependency Injection

  constructor(private readonly configService: ConfigService<Environment>) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Reads the values files that set an image repository. */
  private readImages(): ImageValues[] {
    const images: ImageValues[] = [];

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
        images.push({ document, file });
      }
    }

    return images;
  }

  // 🌎 Public Methods

  /**
   * Writes the version as the tag, or with `DRY_RUN=1` only prints the files
   * it would write.
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

    const dryRun = this.configService.get("DRY_RUN") === "1";

    for (const { document, file } of images) {
      if (dryRun) {
        console.info(`🌵 Dry run, would write image.tag ${version} to ${file}`);
        continue;
      }

      document.setIn(["image", "tag"], version);
      fs.writeFileSync(
        path.join(process.cwd(), file),
        document.toString({ lineWidth: 0 }),
      );
    }
  }
}
