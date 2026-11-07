import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { CheckModule } from "../check/check.module";

import { BatchCommand } from "./batch.command";

/**
 * Wires the `batch` command to the check service it asks for a verdict per
 * project.
 */
@Module({
  controllers: [],
  exports: [BatchCommand],
  imports: [CheckModule, LoggerModule],
  providers: [BatchCommand],
})
export class BatchModule {}
