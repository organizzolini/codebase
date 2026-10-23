import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { CollectCodometerBaselineCommand } from "./collect-codometer-baseline.command";
import { CollectCodometerBaselineService } from "./collect-codometer-baseline.service";

/** Provides the command that gathers the codometer reports into a baseline. */
@Module({
  controllers: [],
  exports: [CollectCodometerBaselineCommand, CollectCodometerBaselineService],
  imports: [LoggerModule],
  providers: [CollectCodometerBaselineCommand, CollectCodometerBaselineService],
})
export class CollectCodometerBaselineModule {}
