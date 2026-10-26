import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import moment from "moment-timezone";
import { Between, Repository } from "typeorm";

import { LoggerService } from "@codebase/observability";

import { CalendarEventTag } from "../database/entities/calendar-event-tag.entity";
import { CalendarEvent } from "../database/entities/calendar-event.entity";
import { TagsService } from "../tags/tags.service";
import { classifyEvent } from "../tags/tags.utilities";

import {
  CALENDAR_EVENT_BATCH_SIZE,
  CALENDAR_EVENT_CONFLICT_COLUMNS,
  CALENDAR_EVENT_TAG_BATCH_SIZE,
  CALENDAR_EVENT_UPDATE_COLUMNS,
  SQLITE_MAXIMUM_PARAMETERS,
} from "./calendar-events.constants";
import {
  calendarEventKey,
  formatCoordinate,
  mapWrittenIds,
  tidyText,
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
   * point, which is also SQLite's default binary collation, so the order never
   * depends on a locale. The ids go in batches that stay under SQLite's
   * bind-parameter limit.
   */
  private async findTagNames(
    eventIds: readonly string[],
  ): Promise<Map<string, string[]>> {
    const names = new Map<string, string[]>();

    for (
      let offset = 0;
      offset < eventIds.length;
      offset += SQLITE_MAXIMUM_PARAMETERS
    ) {
      const links = await this.calendarEventRepository.manager
        .createQueryBuilder(CalendarEventTag, "eventTag")
        .innerJoin("eventTag.tag", "tag")
        .select("eventTag.calendarEventId", "calendarEventId")
        .addSelect("tag.name", "name")
        .where("eventTag.calendarEventId IN (:...eventIds)", {
          eventIds: eventIds.slice(offset, offset + SQLITE_MAXIMUM_PARAMETERS),
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
   * id each was written under, by {@link calendarEventKey}. TypeORM does not
   * advance `updated_at` on a conflicting insert for SQLite, so both audit
   * stamps are written, to the millisecond, and the update takes the new
   * `updated_at`. TypeORM also reloads each inserted row's generated id with
   * one `OR` per row, which SQLite refuses past 1,000 rows, and has no
   * `RETURNING` to read them with, so the reload is turned off and the ids are
   * read back instead: every row of the
   * batch shares `observer`, so one select over that observer's events
   * between the batch's first and last start finds them all.
   */
  private async writeRows(
    manager: EntityManager,
    rows: readonly CalendarEventRow[],
    observer: Observer,
  ): Promise<Map<string, string>> {
    const writtenAt = new Date();
    await manager
      .createQueryBuilder()
      .insert()
      .into(CalendarEvent)
      .values(
        rows.map((row) => ({
          ...row,
          createdAt: writtenAt,
          updatedAt: writtenAt,
        })),
      )
      .updateEntity(false)
      .orUpdate(
        [...CALENDAR_EVENT_UPDATE_COLUMNS],
        [...CALENDAR_EVENT_CONFLICT_COLUMNS],
      )
      .execute();
    const stored = await manager.getRepository(CalendarEvent).find({
      select: { end: true, id: true, start: true, summary: true },
      where: {
        latitude: formatCoordinate(observer.latitude),
        longitude: formatCoordinate(observer.longitude),
        start: Between(
          moment.min(rows.map(({ start }) => start)),
          moment.max(rows.map(({ start }) => start)),
        ),
      },
    });

    return mapWrittenIds(
      stored,
      new Set(
        rows.map(({ end, start, summary }) =>
          calendarEventKey(summary, start, end),
        ),
      ),
    );
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
   * Writes events for one observer, with its timezone, updating the row of
   * any event already stored, and replaces each one's tag links with links
   * to the nodes of the tag tree {@link classifyEvent} classifies it under,
   * inserting any node that is missing. It all runs in one transaction. Rows go in batches that stay under SQLite's
   * bind-parameter limit, and a repeated key within the input keeps its last
   * occurrence, as one statement may not update the same row twice.
   */
  async upsert(
    events: DetectedCalendarEvent[],
    observer: Observer,
  ): Promise<void> {
    const eventsByKey = new Map<string, ClassifiedCalendarEvent>();
    for (const detected of events) {
      const event = {
        ...detected,
        description: tidyText(detected.description),
        summary: tidyText(detected.summary),
      };
      eventsByKey.set(calendarEventKey(event.summary, event.start, event.end), {
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
          observer,
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
