import { Inject, Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";

import {
  DATASET_SQL,
  datasetRowSchema,
  eventRowSchema,
  EVENTS_IN_PERIOD_SQL,
  facetRowSchema,
  FACETS_SQL,
  groupKeysSchema,
} from "./events.constants";
import { EventFilterService } from "./filters/event-filter.service";
import { EventGroupingService } from "./grouping/event-grouping.service";
import { PresetsService } from "./presets/presets.service";
import { WindowsService } from "./windows/windows.service";

import type { CalendarEventEntity } from "./calendar-event.entities";
import type { EventFacetEntity } from "./event-facet.entities";
import type { EventsDatasetEntity } from "./events.entities";
import type { EventFilterGroup } from "./filters/event-filter.types";
import type { EventGroupLevel } from "./grouping/event-grouping.types";
import type { ResolvedPreset } from "./presets/presets.types";
import type { PeriodInput } from "./windows/period-input.entities";
import type { WindowsArguments } from "./windows/windows-arguments.entities";
import type { Windows } from "./windows/windows.types";
import type { z } from "zod";

/**
 * Reads the calendar's events, tag facets and dataset span. Every read is a
 * SQL statement against the Caelundas Postgres, whose rows are validated
 * before they leave the service.
 */
@Injectable()
export class EventsService {
  // 🏗 Dependency Injection

  constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
    @Inject(EventFilterService)
    private readonly filterService: EventFilterService,
    @Inject(EventGroupingService)
    private readonly groupingService: EventGroupingService,
    @Inject(PresetsService) private readonly presetsService: PresetsService,
    @Inject(WindowsService) private readonly windowsService: WindowsService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Writes an instant the GraphQL `DateTime` scalar parsed, or a string it
   * left as is, as the ISO 8601 text Postgres reads as a `timestamptz`.
   */
  private toIsoString(instant: Date | string): string {
    return new Date(instant).toISOString();
  }

  // 🌎 Public Methods

  /**
   * The span and zone of the whole dataset, or null when it holds no event.
   */
  public async describeDataset(): Promise<EventsDatasetEntity | null> {
    const rows = await this.select(DATASET_SQL, [], datasetRowSchema);

    return rows.at(0) ?? null;
  }

  /**
   * The events that overlap the period and meet the filter, earliest first,
   * each with the tags it was given and, for each level of the grouping, the
   * group keys it falls in.
   */
  public async findEvents(
    period: PeriodInput,
    filter?: EventFilterGroup | null,
    grouping: readonly EventGroupLevel[] = [],
  ): Promise<CalendarEventEntity[]> {
    const compiled = this.filterService.compile(filter, 2);
    const filterParameters = compiled?.parameters ?? [];
    const groups = this.groupingService.compile(
      grouping,
      2 + filterParameters.length,
    );
    const rows = await this.select(
      EVENTS_IN_PERIOD_SQL.replace("{filter}", () =>
        compiled === null ? "" : `and ${compiled.sql}`,
      ).replace("{groups}", () => groups.sql),
      [
        this.toIsoString(period.end),
        this.toIsoString(period.start),
        ...filterParameters,
        ...groups.parameters,
      ],
      eventRowSchema,
    );

    return rows.map((row) => ({
      color: row.color,
      description: row.description,
      durationMinutes: row.duration_minutes,
      end: row.end,
      groups: grouping.map((_, level) =>
        groupKeysSchema.parse(row[`group_${String(level)}`]),
      ),
      id: row.id,
      location: row.location,
      start: row.start,
      startLocalDay: row.start_local_day,
      startLocalHour: row.start_local_hour,
      summary: row.summary,
      tags: row.tags,
      timezone: row.timezone,
    }));
  }

  /**
   * Every tag root with the tags beneath it, each counting the events that
   * overlap the period and meet the filter, or every event without a period.
   */
  public async findFacets(
    period?: PeriodInput,
    filter?: EventFilterGroup | null,
  ): Promise<EventFacetEntity[]> {
    const compiled = this.filterService.compile(filter, 2);
    const rows = await this.select(
      FACETS_SQL.replace("{filter}", () =>
        compiled === null ? "" : `and ${compiled.sql}`,
      ),
      [
        period === undefined ? null : this.toIsoString(period.end),
        period === undefined ? null : this.toIsoString(period.start),
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
   * The named presets resolved against the tags the whole
   * dataset has, in menu order.
   */
  public async findPresets(): Promise<ResolvedPreset[]> {
    return this.presetsService.resolve(await this.findFacets());
  }

  /**
   * The days a calendar view or a timeline scale shows around a day, and the
   * period of events to read for them.
   */
  public findWindows(args: WindowsArguments): Windows {
    return this.windowsService.getWindows(args.window, new Date(args.anchor), {
      agendaDays: args.agendaDays,
      scale: args.scale,
    });
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
