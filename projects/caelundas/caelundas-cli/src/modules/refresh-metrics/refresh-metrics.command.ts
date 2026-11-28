import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { Command, CommandRunner } from "nest-commander";
import { DataSource } from "typeorm";

import { CaelundasDatabaseService } from "@codebase/caelundas-db";
import { LoggerService } from "@codebase/observability";

/**
 * Refreshes the metrics tag sets and facts by hand, with no ingest. An
 * ingest already does this, so run it after editing the tag tree or the events by other means.
 */
@Command({
  description:
    "Refresh the tag sets and facts the metrics charts and totals read",
  name: "refresh-metrics",
})
@Injectable()
export class RefreshMetricsCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly databaseService: CaelundasDatabaseService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super();
    this.logger.setContext(RefreshMetricsCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Refreshes the tag sets and the facts, and logs how long it took. */
  async run(): Promise<void> {
    const started = Date.now();

    await this.databaseService.refreshMetrics(this.dataSource.manager);

    this.logger.info("🔄 Refreshed the metrics facts", undefined, {
      milliseconds: Date.now() - started,
    });
  }
}
