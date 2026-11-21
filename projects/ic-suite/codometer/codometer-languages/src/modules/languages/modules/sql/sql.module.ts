import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { SqlService } from "./sql.service";

/**
 * NestJS module that provides Sql source analysis.
 */
@Module({
  controllers: [],
  exports: [SqlService],
  imports: [LoggerModule],
  providers: [SqlService],
})
export class SqlModule {}
