import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import {
  EPHEMERIS_BASE_URL,
  EPHEMERIS_FILENAMES,
  PARTIAL_FILE_SUFFIX,
} from "./ephemeris-download.constants";
import {
  isEphemerisFilePresent,
  resolveEphemerisDirectory,
} from "./ephemeris-download.utilities";

/**
 * Downloads the Swiss Ephemeris data files caelundas computes from.
 *
 * Each file is written to a `.part` file that is renamed only once it is whole,
 * so an interrupted download leaves nothing the next run would take as done.
 * Files already present are left alone, which makes a rerun cheap.
 */
@Injectable()
export class EphemerisDownloadService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(EphemerisDownloadService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Fetches one file and writes it to `destination`, throwing unless a whole,
   * non-empty file arrives. The files are small enough to hold in memory, so a
   * dropped connection fails the read and nothing is written at all.
   */
  private async fetchFile(url: string, destination: string): Promise<void> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to download ${url}: HTTP ${String(response.status)}`,
      );
    }

    const content = Buffer.from(await response.arrayBuffer());

    if (content.length === 0) {
      throw new Error(`Downloaded an empty file from ${url}`);
    }

    const partial = `${destination}${PARTIAL_FILE_SUFFIX}`;

    try {
      await writeFile(partial, content);
      await rename(partial, destination);
    } catch (error) {
      await rm(partial, { force: true });
      throw error;
    }
  }

  // 🌎 Public Methods

  /** Downloads every data file that is not already present. */
  public async download(): Promise<void> {
    const directory = resolveEphemerisDirectory();

    await mkdir(directory, { recursive: true });

    for (const filename of EPHEMERIS_FILENAMES) {
      const destination = path.join(directory, filename);

      if (isEphemerisFilePresent(destination)) {
        this.logger.info(`⏭️ Skipping ${filename}, which is already there`);
        continue;
      }

      this.logger.info(`💾 Downloading ${filename}`);
      await this.fetchFile(`${EPHEMERIS_BASE_URL}/${filename}`, destination);
      this.logger.info(`💾 Downloaded ${filename}`);
    }

    this.logger.info(
      "🧮 Finished downloading every ephemeris file",
      undefined,
      {
        directory,
      },
    );
  }
}
