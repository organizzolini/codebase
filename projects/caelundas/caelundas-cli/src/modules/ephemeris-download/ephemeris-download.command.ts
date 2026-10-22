import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { EphemerisDownloadService } from "./ephemeris-download.service";

/**
 * CLI command that downloads the Swiss Ephemeris data files into
 * `data/ephemeris`, skipping any already there.
 *
 * Runs from its own entry point, `ephemeris-download-cli.main.ts`, because the
 * main application connects to Postgres as it starts, and fetching three files
 * should not need a database. Safe to run again.
 */
@Command({
  description:
    "Download the Swiss Ephemeris data files caelundas computes from, skipping any already present",
  name: "ephemeris-download",
})
@Injectable()
export class EphemerisDownloadCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly ephemerisDownloadService: EphemerisDownloadService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(EphemerisDownloadCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Downloads the data files. */
  public async run(): Promise<void> {
    await this.ephemerisDownloadService.download();
  }
}
