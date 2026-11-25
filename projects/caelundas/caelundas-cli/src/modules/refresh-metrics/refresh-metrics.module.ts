import { Module } from "@nestjs/common";

import { CaelundasDatabaseModule } from "@codebase/caelundas-db";
import { LoggerModule } from "@codebase/observability";

import { RefreshMetricsCommand } from "./refresh-metrics.command";

/**
 * Registers the `refresh-metrics` command, which refreshes the metrics
 * materialized views of the caelundas database.
 */
@Module({
  controllers: [],
  exports: [RefreshMetricsCommand],
  imports: [LoggerModule, CaelundasDatabaseModule],
  providers: [RefreshMetricsCommand],
})
export class RefreshMetricsModule {}
