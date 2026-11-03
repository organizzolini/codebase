import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { NightSkySourceError } from "./night-sky.constants";
import { NightSkyService } from "./night-sky.service";

import type { NightSkyCommandOptions, NightSkyFiles } from "./night-sky.types";

/**
 * Ingests the night sky caelundas-web draws into the database it reads: the
 * HYG star catalog, and d3-celestial's constellations and their figures,
 * each from a file downloaded beforehand. Safe to run again: each run
 * replaces the rows the last one wrote.
 */
@Command({
  description:
    "Ingest the star catalog and the constellation figures the web calendar's night sky draws",
  name: "night-sky",
})
@Injectable()
export class NightSkyCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly nightSkyService: NightSkyService,
  ) {
    super();
    this.logger.setContext(NightSkyCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The three paths, or an error naming the first option missing.
   *
   * @throws NightSkySourceError when an option is missing.
   */
  private requireFiles(options: NightSkyCommandOptions): NightSkyFiles {
    const { constellations, lines, stars } = options;

    if (
      stars === undefined ||
      constellations === undefined ||
      lines === undefined
    ) {
      throw new NightSkySourceError(
        "Pass --stars, --constellations and --lines, the paths of the downloaded HYG CSV and d3-celestial's constellations.json and constellations.lines.json",
      );
    }

    return { constellations, lines, stars };
  }

  // 🌎 Public Methods

  /** Parses `--constellations`, the path of d3-celestial's constellations.json. */
  @Option({
    description: "Path of d3-celestial's data/constellations.json",
    flags: "--constellations <path>",
  })
  parseConstellations(value: string): string {
    return value;
  }

  /** Parses `--lines`, the path of d3-celestial's constellations.lines.json. */
  @Option({
    description: "Path of d3-celestial's data/constellations.lines.json",
    flags: "--lines <path>",
  })
  parseLines(value: string): string {
    return value;
  }

  /** Parses `--stars`, the path of the HYG database's CSV. */
  @Option({
    description: "Path of the HYG database's CSV, such as hygdata_v41.csv",
    flags: "--stars <path>",
  })
  parseStars(value: string): string {
    return value;
  }

  /** Ingests the three files. */
  async run(
    _passedParameters: string[],
    options: NightSkyCommandOptions = {},
  ): Promise<void> {
    await this.nightSkyService.ingest(this.requireFiles(options));
  }
}
