import { Module } from "@nestjs/common";

import { MeanderawDatabaseModule } from "@codebase/meanderaw-db";

import { AggregateCommand } from "./aggregate.command";

/**
 * Registers the `aggregate` command over the meanderaw database.
 */
@Module({
  controllers: [],
  exports: [AggregateCommand],
  imports: [MeanderawDatabaseModule],
  providers: [AggregateCommand],
})
export class AggregateModule {}
