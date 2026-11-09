import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import {
  CaelundasDatabaseService,
  CalendarEvent,
  CalendarEventTag,
} from "@codebase/caelundas-db";
import { LoggerService } from "@codebase/observability";

import { POSTGRES_MAXIMUM_PARAMETERS } from "../../caelundas-cli.constants";
import { TagsService } from "../tags/tags.service";
import { classifyEvent, tagPathKey } from "../tags/tags.utilities";

import {
  CALENDAR_EVENT_BATCH_SIZE,
  CALENDAR_EVENT_CONFLICT_COLUMNS,
  CALENDAR_EVENT_TAG_BATCH_SIZE,
  CALENDAR_EVENT_UPDATE_COLUMNS,
  COORDINATE_DECIMAL_PLACES,
} from "./calendar-events.constants";

import type { ClassifiedCalendarEvent } from "../tags/tags.types";
import type {
  CalendarEventRow,
  CalendarEventTagLink,
  DetectedCalendarEvent,
  FindInRangeParameters,
  Observer,
  StoredCalendarEvent,
  WrittenCalendarEvent,
} from "./calendar-events.types";
import type { Moment } from "moment-timezone";
import type { EntityManager } from "typeorm";

/**
 * Persists detected events and reads them back for rendering. An event is
 * keyed by summary, start, and location, and links to the tag tree nodes its
 * tags classify under.
 */
@Injectable()
export class CalendarEventsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    @InjectRepository(CalendarEvent)
    private readonly calendarEventRepository: Repository<CalendarEvent>,
    private readonly tagsService: TagsService,
    private readonly databaseService: CaelundasDatabaseService,
  ) {
    this.logger.setContext(CalendarEventsService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Names of each event's direct tags, ordered by code point, not locale or
   * collation; ids go in batches under the bind-parameter limit.
   */
  private async findTagNames(
    eventIds: readonly string[],
  ): Promise<Map<string, string[]>> {
    const names = new Map<string, string[]>();

    for (
      let offset = 0;
      offset < eventIds.length;
      offset += POSTGRES_MAXIMUM_PARAMETERS
    ) {
      const links = await this.calendarEventRepository.manager
        .createQueryBuilder(CalendarEventTag, "eventTag")
        .innerJoin("eventTag.tag", "tag")
        .select("eventTag.calendarEventId", "calendarEventId")
        .addSelect("tag.name", "name")
        .where("eventTag.calendarEventId IN (:...eventIds)", {
          eventIds: eventIds.slice(
            offset,
            offset + POSTGRES_MAXIMUM_PARAMETERS,
          ),
        })
        .getRawMany<{ calendarEventId: string; name: string }>();

      for (const { calendarEventId, name } of links) {
        names.set(calendarEventId, [
          ...(names.get(calendarEventId) ?? []),
          name,
        ]);
      }
    }

    for (const [calendarEventId, eventNames] of names) {
      names.set(calendarEventId, [...new Set(eventNames)].toSorted());
    }

    return names;
  }

  /**
   * Replaces the written events' tag links: old links are deleted first, so a
   * dropped tag goes and a repeated link is inserted once.
   */
  private async replaceTagLinks(
    manager: EntityManager,
    eventIds: readonly string[],
    links: readonly CalendarEventTagLink[],
  ): Promise<void> {
    await manager
      .createQueryBuilder()
      .delete()
      .from(CalendarEventTag)
      .where("calendarEventId IN (:...eventIds)", { eventIds })
      .execute();

    for (
      let offset = 0;
      offset < links.length;
      offset += CALENDAR_EVENT_TAG_BATCH_SIZE
    ) {
      await manager
        .createQueryBuilder()
        .insert()
        .into(CalendarEventTag)
        .values(links.slice(offset, offset + CALENDAR_EVENT_TAG_BATCH_SIZE))
        .orIgnore()
        .execute();
    }
  }

  /** The row an event becomes for one observer. */
  private toRow(
    event: DetectedCalendarEvent,
    observer: Observer,
  ): CalendarEventRow {
    return {
      color: event.color ?? null,
      description: event.description,
      end: event.end,
      latitude: this.formatCoordinate(observer.latitude),
      location: event.location ?? null,
      longitude: this.formatCoordinate(observer.longitude),
      start: event.start,
      summary: event.summary,
      timezone: observer.timezone,
    };
  }

  /**
   * Writes a batch of rows, updating those already stored, and returns each
   * written id by {@link calendarEventKey}.
   */
  private async writeRows(
    manager: EntityManager,
    rows: readonly CalendarEventRow[],
  ): Promise<Map<string, string>> {
    const result = await manager
      .createQueryBuilder()
      .insert()
      .into(CalendarEvent)
      .values([...rows])
      .orUpdate(
        [...CALENDAR_EVENT_UPDATE_COLUMNS],
        [...CALENDAR_EVENT_CONFLICT_COLUMNS],
      )
      .returning(["id", "summary", "start", "end"])
      .execute();

    // `RETURNING` rows are the driver's raw answer, which TypeORM types as `any`.
    const { raw } = result as { raw: readonly WrittenCalendarEvent[] };

    return this.mapWrittenIds(
      raw,
      new Set(
        rows.map(({ end, start, summary }) =>
          this.calendarEventKey(summary, start, end),
        ),
      ),
    );
  }

  // 🌎 Public Methods

  /**
   * Keys an event by summary and instants; the end tells apart a boundary and
   * span sharing a title and start.
   */
  calendarEventKey(
    summary: string,
    start: Date | Moment,
    end: Date | Moment,
  ): string {
    return `${summary}\u0000${start.toISOString()}\u0000${end.toISOString()}`;
  }

  /**
   * Stored events at one location overlapping a range, by start, with tag
   * names; events spanning an edge count, and an instant counts inside.
   */
  async findInRange(
    parameters: FindInRangeParameters,
  ): Promise<StoredCalendarEvent[]> {
    const events = await this.calendarEventRepository
      .createQueryBuilder("calendarEvent")
      .where("calendarEvent.latitude = :latitude", {
        latitude: this.formatCoordinate(parameters.latitude),
      })
      .andWhere("calendarEvent.longitude = :longitude", {
        longitude: this.formatCoordinate(parameters.longitude),
      })
      .andWhere("calendarEvent.start < :end", {
        end: parameters.end.toISOString(),
      })
      .andWhere(
        "(calendarEvent.end > :start OR (calendarEvent.end = calendarEvent.start AND calendarEvent.start >= :start))",
        { start: parameters.start.toISOString() },
      )
      .orderBy("calendarEvent.start", "ASC")
      .addOrderBy("calendarEvent.summary", "ASC")
      .getMany();

    if (events.length === 0) {
      return [];
    }

    const tagNames = await this.findTagNames(events.map(({ id }) => id));

    return events.map((event) =>
      Object.assign(event, { tags: tagNames.get(event.id) ?? [] }),
    );
  }

  /**
   * A coordinate rounded to the stored decimals, as the text the column holds,
   * so writes and lookups compare exactly.
   */
  formatCoordinate(coordinate: number): string {
    return coordinate.toFixed(COORDINATE_DECIMAL_PLACES);
  }

  /**
   * Maps each stored row's key (by {@link calendarEventKey}) to its id, ignoring
   * the database's answer order; keeps only `wanted` keys.
   */
  mapWrittenIds(
    stored: readonly WrittenCalendarEvent[],
    wanted: ReadonlySet<string>,
  ): Map<string, string> {
    const ids = new Map<string, string>();

    for (const { end, id, start, summary } of stored) {
      const key = this.calendarEventKey(summary, start, end);

      if (wanted.has(key)) {
        ids.set(key, id);
      }
    }

    return ids;
  }

  /**
   * Trims text and collapses each run of whitespace to one space, so titles
   * never start with or carry a double space.
   */
  tidyText(text: string): string {
    return text.replaceAll(/\s+/gu, " ").trim();
  }

  /**
   * Links each written event to its tag nodes, once per pair; throws if an id
   * or node is missing, losing tags.
   */
  toTagLinks(
    batch: readonly (readonly [string, ClassifiedCalendarEvent])[],
    eventIds: ReadonlyMap<string, string>,
    tagIds: ReadonlyMap<string, string>,
  ): CalendarEventTagLink[] {
    const links = new Map<string, CalendarEventTagLink>();

    for (const [key, { event, paths }] of batch) {
      const calendarEventId = eventIds.get(key);

      if (calendarEventId === undefined) {
        throw new Error(`No id was read back for the event "${event.summary}"`);
      }

      for (const path of paths) {
        const tagId = tagIds.get(tagPathKey(path));
        if (tagId === undefined) {
          throw new Error(
            `The tag "${path.join(" > ")}" of the event "${event.summary}" was not resolved`,
          );
        }
        links.set(`${calendarEventId}\u0000${tagId}`, {
          calendarEventId,
          tagId,
        });
      }
    }

    return [...links.values()];
  }

  /**
   * Writes one observer's events in a single transaction, then rebuilds the read
   * model. A repeated key keeps its last occurrence.
   */
  async upsert(
    events: DetectedCalendarEvent[],
    observer: Observer,
  ): Promise<void> {
    const eventsByKey = new Map<string, ClassifiedCalendarEvent>();
    for (const detected of events) {
      const event = {
        ...detected,
        description: this.tidyText(detected.description),
        summary: this.tidyText(detected.summary),
      };
      eventsByKey.set(
        this.calendarEventKey(event.summary, event.start, event.end),
        {
          event,
          paths: classifyEvent(event),
        },
      );
    }
    const keyed = [...eventsByKey.entries()];

    if (keyed.length === 0) {
      return;
    }

    await this.calendarEventRepository.manager.transaction(async (manager) => {
      const tagIds = await this.tagsService.resolve(
        manager,
        keyed.flatMap(([, { paths }]) => paths),
      );

      for (
        let offset = 0;
        offset < keyed.length;
        offset += CALENDAR_EVENT_BATCH_SIZE
      ) {
        const batch = keyed.slice(offset, offset + CALENDAR_EVENT_BATCH_SIZE);
        const ids = await this.writeRows(
          manager,
          batch.map(([, { event }]) => this.toRow(event, observer)),
        );
        await this.replaceTagLinks(
          manager,
          [...ids.values()],
          this.toTagLinks(batch, ids, tagIds),
        );
      }

      await this.databaseService.refreshReadModel(manager);
    });

    this.logger.info("💾 Stored events", undefined, {
      count: keyed.length,
      latitude: observer.latitude,
      longitude: observer.longitude,
      timezone: observer.timezone,
    });
  }
}
