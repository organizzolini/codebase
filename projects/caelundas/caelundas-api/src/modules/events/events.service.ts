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
import { DEFAULT_EVENT_SCOPE } from "./modules/filtering/event-filter.constants";
import { EventFilterService } from "./modules/filtering/event-filter.service";
import { compileEventScope } from "./modules/filtering/modules/query-building/event-scope.utilities";
import { EventGroupingService } from "./modules/grouping/event-grouping.service";
import { compareRankedPaths } from "./modules/natural-order/natural-order.utilities";
import { PresetsService } from "./modules/presets/presets.service";
import { WindowsService } from "./modules/windows/windows.service";

import type { EventsDatasetEntity } from "./events.entities";
import type { EventsReadOptions } from "./events.types";
import type { CalendarEventEntity } from "./modules/calendar-event/calendar-event.entities";
import type { EventFacetValueEntity } from "./modules/facets/event-facet-value.entities";
import type { EventFacetEntity } from "./modules/facets/event-facet.entities";
import type { EventFilterGroup } from "./modules/filtering/event-filter.types";
import type { RankedName } from "./modules/natural-order/natural-order.types";
import type { ResolvedPreset } from "./modules/presets/presets.types";
import type { PeriodInput } from "./modules/windows/period-input.entities";
import type { WindowsArguments } from "./modules/windows/windows-arguments.entities";
import type { Windows } from "./modules/windows/windows.types";
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
   * Each tag's parents, by id, with the path of one appearance of each.
   */
  private collectParents(
    rows: readonly z.infer<typeof facetRowSchema>[],
  ): Map<string, Map<string, string>> {
    const parentPaths = new Map<string, Map<string, string>>();

    for (const row of rows) {
      if (row.parent_id !== null && row.parent_path !== null) {
        const parents = parentPaths.get(row.id) ?? new Map<string, string>();

        parents.set(
          row.parent_id,
          parents.get(row.parent_id) ?? row.parent_path,
        );
        parentPaths.set(row.id, parents);
      }
    }

    return parentPaths;
  }

  /**
   * A tag root, with no tags beneath it yet.
   */
  private toFacetRoot(row: z.infer<typeof facetRowSchema>): EventFacetEntity {
    return {
      icon: row.icon,
      id: row.id,
      isFilterable: row.is_filterable,
      isGroupable: row.is_groupable,
      isSelectable: row.is_selectable,
      isSortable: row.is_sortable,
      name: row.name,
      note: row.note,
      slug: row.slug,
      values: [],
    };
  }

  /**
   * Assembles the tag roots, each with its tags, one value a path.
   */
  private toFacets(
    rows: readonly z.infer<typeof facetRowSchema>[],
  ): EventFacetEntity[] {
    const facets = new Map<string, EventFacetEntity>();
    const levelsByPath = new Map<string, RankedName[]>();
    const parentPaths = this.collectParents(rows);

    for (const row of rows) {
      if (row.depth === 0) {
        facets.set(row.id, this.toFacetRoot(row));
      } else {
        levelsByPath.set(
          `${row.id}\u0000${row.path_below_root}`,
          this.toRankedLevels(row.tag_rank),
        );
        facets
          .get(row.root_id)
          ?.values.push(this.toFacetValue(row, parentPaths.get(row.id)));
      }
    }

    for (const facet of facets.values()) {
      facet.values.sort((left, right) =>
        compareRankedPaths(
          levelsByPath.get(`${left.id}\u0000${left.path}`) ?? [],
          levelsByPath.get(`${right.id}\u0000${right.path}`) ?? [],
        ),
      );
    }

    return [...facets.values()];
  }

  /**
   * One place a tag sits, naming the other parents it sits under.
   */
  private toFacetValue(
    row: z.infer<typeof facetRowSchema>,
    parents: ReadonlyMap<string, string> | undefined,
  ): EventFacetValueEntity {
    const otherParents = [...(parents ?? [])]
      .filter(([parentId]) => parentId !== row.parent_id)
      .map(([, parentPath]) => parentPath);

    return {
      alsoUnder: otherParents.toSorted(),
      count: row.count,
      depth: row.depth,
      icon: row.icon,
      id: row.id,
      isFilterable: row.is_filterable,
      isGroupable: row.is_groupable,
      isSelectable: row.is_selectable,
      isSortable: row.is_sortable,
      name: row.name,
      note: row.note,
      path: row.path_below_root,
      slug: row.slug,
    };
  }

  /**
   * Formats an instant as the ISO 8601 text Postgres reads as a timestamptz.
   */
  private toIsoString(instant: Date | string): string {
    return new Date(instant).toISOString();
  }

  /**
   * Each level of a rank path beneath the root, with its place among its siblings, so siblings sort as intended.
   */
  private toRankedLevels(rankPath: string): RankedName[] {
    return rankPath
      .split(" / ")
      .slice(1)
      .map((level) => {
        const colon = level.indexOf(":");

        return {
          name: level.slice(colon + 1),
          rank: Number(level.slice(0, colon)),
        };
      });
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
   * Events overlapping the period, in scope and meeting the filter, earliest
   * first, with their tags and group keys.
   */
  public async findEvents(
    period: PeriodInput,
    filter?: EventFilterGroup | null,
    options: EventsReadOptions = {},
  ): Promise<CalendarEventEntity[]> {
    const { grouping = [], scope = DEFAULT_EVENT_SCOPE } = options;
    const compiled = this.filterService.compile(filter, 2);
    const filterParameters = compiled?.parameters ?? [];
    const groups = this.groupingService.compile(
      grouping,
      2 + filterParameters.length,
    );
    const rows = await this.select(
      EVENTS_IN_PERIOD_SQL.replace("{scope}", () =>
        compileEventScope(scope, "e.id"),
      )
        .replace("{filter}", () =>
          compiled === null ? "" : `and ${compiled.sql}`,
        )
        .replace("{groups}", () => groups.sql),
      [
        this.toIsoString(period.end),
        this.toIsoString(period.start),
        ...filterParameters,
        ...groups.parameters,
      ],
      eventRowSchema,
    );

    return rows.map((row) => ({
      durationMinutes: row.duration_minutes,
      end: row.end,
      groups: grouping.map((_, level) =>
        groupKeysSchema.parse(row[`group_${String(level)}`]),
      ),
      id: row.id,
      name: row.name,
      note: row.note,
      start: row.start,
      startLocalDay: row.start_local_day,
      startLocalHour: row.start_local_hour,
      tags: row.tags,
      timezone: row.timezone,
    }));
  }

  /**
   * Every tag root and its tags, counting events in the period and filter.
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
    return this.toFacets(rows);
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
   * Runs one statement and parses each row with `schema`, failing on
   * unexpected shapes.
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
