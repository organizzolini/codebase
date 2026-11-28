import { Module } from "@nestjs/common";

import { CaelundasDatabaseModule } from "@codebase/caelundas-db";
import { LoggerModule } from "@codebase/observability";

import { MetricExpressionsCommand } from "./metric-expressions.command";
import { MetricExpressionsService } from "./metric-expressions.service";

/**
 * Draws the metrics' expression trees from the caelundas database as Mermaid
 * flowcharts, in a Markdown file.
 */
@Module({
  controllers: [],
  exports: [MetricExpressionsCommand, MetricExpressionsService],
  imports: [LoggerModule, CaelundasDatabaseModule],
  providers: [MetricExpressionsCommand, MetricExpressionsService],
})
export class MetricExpressionsModule {}
