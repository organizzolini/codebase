import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";

import {
  DATASET_SQL,
  datasetRowSchema,
  eventRowSchema,
  EVENTS_IN_WINDOW_SQL,
} from "./events.constants";

import type { CalendarEventEntity } from "./calendar-event.entities";
import type { EventsWindowInput } from "./events-window-input.entities";
import type { EventsDatasetEntity } from "./events.entities";
import type { z } from "zod";

/**
 * Reads the calendar's events, tag facets and dataset span. Every read is a
 * SQL statement against the Caelundas Postgres, whose rows are validated
 * before they leave the service.
 */
@Injectable()
export class EventsService {
  // 🏗 Dependency Injection

  constructor(@InjectEntityManager() private readonly manager: EntityManager) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * The span and zone of the whole dataset, or null when it holds no event.
   */
  public async describeDataset(): Promise<EventsDatasetEntity | null> {
    const rows = await this.select(DATASET_SQL, [], datasetRowSchema);

    return rows.at(0) ?? null;
  }

  /**
   * The events that overlap the window, earliest first, each with the tags
   * it was given.
   */
  public async findEvents(
    window: EventsWindowInput,
  ): Promise<CalendarEventEntity[]> {
    const rows = await this.select(
      EVENTS_IN_WINDOW_SQL,
      [window.end.toISOString(), window.start.toISOString()],
      eventRowSchema,
    );

    return rows.map(
      ({ duration_minutes, start_local_day, start_local_hour, ...row }) => ({
        ...row,
        durationMinutes: duration_minutes,
        startLocalDay: start_local_day,
        startLocalHour: start_local_hour,
      }),
    );
  }

  /**
   * Runs one statement with its `$n` parameters on the shared connection and
   * parses every row with `schema`, so a column the database returns in an
   * unexpected shape fails here rather than reaching a client.
   */
  public async select<Row>(
    sql: string,
    parameters: readonly unknown[],
    schema: z.ZodType<Row>,
  ): Promise<Row[]> {
    const rows = await this.manager.query<unknown[]>(sql, [...parameters]);

    return rows.map((row) => schema.parse(row));
  }
}
