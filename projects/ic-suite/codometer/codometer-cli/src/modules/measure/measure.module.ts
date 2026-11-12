import { ConfigurationModule } from "@codometer/configuration";
import { MeasureModule as CodometerMeasureModule } from "@codometer/measurement";
import {
  DeliveryModule,
  DestinationsModule,
  ReportModule,
} from "@codometer/output";
import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { MeasureCommand } from "./measure.command";

/**
 * NestJS module wiring the measure command to its layers.
 *
 * Only wiring. Configuration reads the command line and file, measurement
 * counts, and output resolves, builds, and delivers reports. The command sets
 * the exit code.
 */
@Module({
  controllers: [],
  exports: [MeasureCommand],
  imports: [
    CodometerMeasureModule,
    ConfigurationModule,
    DeliveryModule,
    DestinationsModule,
    LoggerModule,
    ReportModule,
  ],
  providers: [MeasureCommand],
})
export class MeasureModule {}
