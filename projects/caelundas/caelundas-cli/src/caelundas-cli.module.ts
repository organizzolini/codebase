import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { environmentSchema } from "./caelundas-cli.constants";
import { CaelundasModule } from "./modules/caelundas/caelundas.module";
import { NightSkyModule } from "./modules/night-sky/night-sky.module";
import { MetricExpressionsModule } from "./modules/refresh-metrics/modules/metric-expressions/metric-expressions.module";
import { RefreshMetricsModule } from "./modules/refresh-metrics/refresh-metrics.module";

/**
 * Root NestJS application module.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "configuration/.env",
      isGlobal: true,
      validate: (config: Record<string, unknown>) =>
        environmentSchema.parse(config),
    }),
    DiscoveryModule,
    LoggerModule,
    CaelundasModule,
    MetricExpressionsModule,
    NightSkyModule,
    RefreshMetricsModule,
  ],
})
export class MainModule {}
