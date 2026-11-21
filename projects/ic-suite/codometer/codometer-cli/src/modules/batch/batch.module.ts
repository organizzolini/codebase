import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { MeasureModule } from "../measure/measure.module";

import { BatchCommand } from "./batch.command";

/**
 * Wires the `batch` command to the measure command it asks for an outcome per
 * directory.
 */
@Module({
  controllers: [],
  exports: [BatchCommand],
  imports: [LoggerModule, MeasureModule],
  providers: [BatchCommand],
})
export class BatchModule {}
