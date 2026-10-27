import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { EventsDatabaseService } from "./events-database.service";

import type { EventsDatabaseCommandOptions } from "./events-database.types";

/**
 * Writes the SQLite file caelundas-web bundles, `output/events.sqlite`, from
 * the database `caelundas` ingested into or, with `--seed`, from the
 * committed rows. Runs from its own entry point, `events-database-cli.main.ts`,
 * so building a bundle never opens the ingestion database.
 */
@Command({
  description:
    "Write the SQLite file caelundas-web bundles, from the ingested database or the committed seed",
  name: "events-database",
})
@Injectable()
export class EventsDatabaseCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly eventsDatabaseService: EventsDatabaseService,
  ) {
    super();
    this.logger.setContext(EventsDatabaseCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Where to write the bundle. */
  @Option({
    description: "The file to write, output/events.sqlite by default",
    flags: "--output <file>",
  })
  parseOutput(value: string): string {
    return value;
  }

  /** Builds from the committed seed rows instead of an ingested database. */
  @Option({
    description: "Build from the committed seed rows, not an ingested database",
    flags: "--seed",
  })
  parseSeed(): boolean {
    return true;
  }

  /** The ingested database to build from. */
  @Option({
    description:
      "The ingested database to build from, the file a caelundas run writes by default",
    flags: "--source <file>",
  })
  parseSource(value: string): string {
    return value;
  }

  /** Builds the bundle from the options given, and logs where it went. */
  async run(
    _passedParameters: string[],
    options: EventsDatabaseCommandOptions = {},
  ): Promise<void> {
    const output = await this.eventsDatabaseService.build(options);

    this.logger.info("📦 Built the events database", undefined, { output });
  }
}
