import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";

import { resolveEventFilterCollections } from "./event-filter-collections.utilities";
import { compileEventFilter } from "./event-filter-compiler.utilities";
import {
  DATASET_SQL,
  datasetRowSchema,
  eventRowSchema,
  EVENTS_IN_WINDOW_SQL,
  facetRowSchema,
  FACETS_SQL,
} from "./events.constants";
import { toIsoString } from "./events.utilities";

import type { CalendarEventEntity } from "./calendar-event.entities";
import type { EventFacetEntity } from "./event-facet.entities";
import type { ResolvedEventFilterCollection } from "./event-filter-collections.types";
import type { EventFilterGroup } from "./event-filter.types";
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
   * The events that overlap the window and meet the filter, earliest first,
   * each with the tags it was given.
   */
  public async findEvents(
    window: EventsWindowInput,
    filter?: EventFilterGroup | null,
  ): Promise<CalendarEventEntity[]> {
    const compiled = compileEventFilter(filter, 2);
    const rows = await this.select(
      EVENTS_IN_WINDOW_SQL.replace("{filter}", () =>
        compiled === null ? "" : `and ${compiled.sql}`,
      ),
      [
        toIsoString(window.end),
        toIsoString(window.start),
        ...(compiled?.parameters ?? []),
      ],
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
   * Every tag root with the tags beneath it, each counting the events that
   * overlap the window and meet the filter, or every event without a window.
   */
  public async findFacets(
    window?: EventsWindowInput,
    filter?: EventFilterGroup | null,
  ): Promise<EventFacetEntity[]> {
    const compiled = compileEventFilter(filter, 2);
    const rows = await this.select(
      FACETS_SQL.replace("{filter}", () =>
        compiled === null ? "" : `and ${compiled.sql}`,
      ),
      [
        window === undefined ? null : toIsoString(window.end),
        window === undefined ? null : toIsoString(window.start),
        ...(compiled?.parameters ?? []),
      ],
      facetRowSchema,
    );
    const facets = new Map<string, EventFacetEntity>();

    for (const row of rows) {
      if (row.depth === 0) {
        facets.set(row.id, { id: row.id, name: row.name, values: [] });
        continue;
      }

      facets.get(row.root_id)?.values.push({
        count: row.count,
        depth: row.depth,
        id: row.id,
        name: row.name,
        path: row.path_below_root,
      });
    }

    return [...facets.values()];
  }

  /**
   * The named filter collections resolved against the tags the whole
   * dataset has, in menu order.
   */
  public async findFilterCollections(): Promise<
    ResolvedEventFilterCollection[]
  > {
    return resolveEventFilterCollections(await this.findFacets());
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
