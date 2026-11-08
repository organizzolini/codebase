import { Module } from "@nestjs/common";

import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";

/**
 * Events module: reads the calendar's events, tag facets and dataset span
 * from the Caelundas Postgres, through the connection that
 * `CaelundasDatabaseModule` opens.
 */
@Module({
  controllers: [],
  exports: [EventsService],
  imports: [],
  providers: [EventsResolver, EventsService],
})
export class EventsModule {}
