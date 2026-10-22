import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { LoggerService } from "@codebase/observability";

import { CalendarEventTag } from "../database/entities/calendar-event-tag.entity";
import { CalendarEvent } from "../database/entities/calendar-event.entity";
import { TagsService } from "../tags/tags.service";
import { classifyEvent } from "../tags/tags.utilities";

import {
  CALENDAR_EVENT_BATCH_SIZE,
  CALENDAR_EVENT_CONFLICT_COLUMNS,
  CALENDAR_EVENT_RETURNING_COLUMNS,
  CALENDAR_EVENT_TAG_BATCH_SIZE,
  CALENDAR_EVENT_UPDATE_COLUMNS,
} from "./calendar-events.constants";
import {
  calendarEventKey,
  formatCoordinate,
  mapWrittenIds,
  toTagLinks,
} from "./calendar-events.utilities";

import type {
  DetectedCalendarEvent,
  StoredCalendarEvent,
} from "../database/database.types";
import type {
  CalendarEventRow,
  CalendarEventTagLink,
  ClassifiedCalendarEvent,
  FindInRangeParameters,
  Observer,
} from "./calendar-events.types";
import type { EntityManager } from "typeorm";

/**
 * Persists the events a run detects and reads them back for rendering.
 *
 * An event is keyed by its summary, start, and the location it was computed
 * for, so writing the same event again updates its row instead of adding one.
 * Its raw tags are classified into paths of the tag tree, and it is stored
 * linked to the nodes {@link TagsService} resolves those paths to.
 */
@Injectable()
export class CalendarEventsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    @InjectRepository(CalendarEvent)
    private readonly calendarEventRepository: Repository<CalendarEvent>,
    private readonly tagsService: TagsService,
  ) {
    this.logger.setContext(CalendarEventsService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The names of the tags each event is linked to directly, ordered by code
   * point, as Postgres's "C" collation would, so the order never depends on
   * the database's locale.
   */
  private async findTagNames(
    eventIds: readonly string[],
  ): Promise<Map<string, string[]>> {
    const links = await this.calendarEventRepository.manager
      .createQueryBuilder(CalendarEventTag, "eventTag")
      .innerJoin("eventTag.tag", "tag")
      .select("eventTag.calendarEventId", "calendarEventId")
      .addSelect("tag.name", "name")
      .where("eventTag.calendarEventId = ANY(:eventIds)", { eventIds })
      .getRawMany<{ calendarEventId: string; name: string }>();
    const names = new Map<string, string[]>();

    for (const { calendarEventId, name } of links) {
      names.set(calendarEventId, [...(names.get(calendarEventId) ?? []), name]);
    }

    for (const [calendarEventId, eventNames] of names) {
      names.set(calendarEventId, [...new Set(eventNames)].toSorted());
    }

    return names;
  }

  /**
   * Replaces the tag links of the written events with `links`: every link
   * those events already had is deleted first, so a tag a re-run no longer
   * reports is dropped, and a repeated link is inserted once.
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
      .where("calendarEventId = ANY(:eventIds)", { eventIds })
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
      latitude: formatCoordinate(observer.latitude),
      location: event.location ?? null,
      longitude: formatCoordinate(observer.longitude),
      start: event.start,
      summary: event.summary,
      timezone: observer.timezone,
    };
  }

  /**
   * Writes one batch of rows, updating any already stored, and returns the
   * id each was written under, by {@link calendarEventKey}, from the summary
   * and start each row reads back with its id.
   */
  private async writeRows(
    manager: EntityManager,
    rows: readonly CalendarEventRow[],
  ): Promise<Map<string, string>> {
    const { generatedMaps } = await manager
      .createQueryBuilder()
      .insert()
      .into(CalendarEvent)
      .values([...rows])
      .orUpdate(
        [...CALENDAR_EVENT_UPDATE_COLUMNS],
        [...CALENDAR_EVENT_CONFLICT_COLUMNS],
      )
      .returning([...CALENDAR_EVENT_RETURNING_COLUMNS])
      .execute();

    return mapWrittenIds(generatedMaps);
  }

  // 🌎 Public Methods

  /**
   * Returns the stored events at one location that overlap a range, ordered
   * by start, each with the names of the tags it is linked to directly. An event overlaps when it
   * starts before the range ends and ends after the range starts, so one
   * spanning either edge, like a retrograde, is included; an instant is
   * included when it falls inside the range.
   */
  async findInRange(
    parameters: FindInRangeParameters,
  ): Promise<StoredCalendarEvent[]> {
    const events = await this.calendarEventRepository
      .createQueryBuilder("calendarEvent")
      .where("calendarEvent.latitude = :latitude", {
        latitude: formatCoordinate(parameters.latitude),
      })
      .andWhere("calendarEvent.longitude = :longitude", {
        longitude: formatCoordinate(parameters.longitude),
      })
      .andWhere("calendarEvent.start < :end", { end: parameters.end.toDate() })
      .andWhere(
        "(calendarEvent.end > :start OR (calendarEvent.end = calendarEvent.start AND calendarEvent.start >= :start))",
        { start: parameters.start.toDate() },
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
   * Writes events for one observer, with its timezone, updating the row of
   * any event already stored, and replaces each one's tag links with links
   * to the nodes of the tag tree {@link classifyEvent} classifies it under,
   * inserting any node that is missing. It all runs in one transaction. Rows go in batches that stay under Postgres's
   * bind-parameter limit, and a repeated key within the input keeps its last
   * occurrence, as one statement may not update the same row twice.
   */
  async upsert(
    events: DetectedCalendarEvent[],
    observer: Observer,
  ): Promise<void> {
    const eventsByKey = new Map<string, ClassifiedCalendarEvent>();
    for (const event of events) {
      eventsByKey.set(calendarEventKey(event.summary, event.start), {
        event,
        paths: classifyEvent(event),
      });
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
          toTagLinks(batch, ids, tagIds),
        );
      }
    });

    this.logger.info("💾 Stored events", undefined, {
      count: keyed.length,
      latitude: observer.latitude,
      longitude: observer.longitude,
      timezone: observer.timezone,
    });
  }
}
