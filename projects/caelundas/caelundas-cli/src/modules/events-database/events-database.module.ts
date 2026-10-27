import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { EventsDatabaseCommand } from "./events-database.command";
import { EventsDatabaseService } from "./events-database.service";

/** Builds the SQLite file caelundas-web bundles. */
@Module({
  controllers: [],
  exports: [EventsDatabaseCommand, EventsDatabaseService],
  imports: [LoggerModule],
  providers: [EventsDatabaseCommand, EventsDatabaseService],
})
export class EventsDatabaseModule {}
