import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import moment from "moment-timezone";
import { Between, Repository } from "typeorm";

import { LoggerService } from "@codebase/observability";

import { CalendarEventTag } from "../database/entities/calendar-event-tag.entity";
import { CalendarEvent } from "../database/entities/calendar-event.entity";
import { TagsService } from "../tags/tags.service";
import { classifyEvent, tagPathKey } from "../tags/tags.utilities";

import {
  CALENDAR_EVENT_BATCH_SIZE,
  CALENDAR_EVENT_CONFLICT_COLUMNS,
  CALENDAR_EVENT_TAG_BATCH_SIZE,
  CALENDAR_EVENT_UPDATE_COLUMNS,
  COORDINATE_DECIMAL_PLACES,
  SQLITE_MAXIMUM_PARAMETERS,
} from "./calendar-events.constants";

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
import type { Moment } from "moment-timezone";
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
      latitude: this.formatCoordinate(observer.latitude),
      location: event.location ?? null,
      longitude: this.formatCoordinate(observer.longitude),
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
        latitude: this.formatCoordinate(observer.latitude),
        longitude: this.formatCoordinate(observer.longitude),
        start: Between(
          moment.min(rows.map(({ start }) => start)),
          moment.max(rows.map(({ start }) => start)),
        ),
      },
    });

    return this.mapWrittenIds(
      stored,
      new Set(
        rows.map(({ end, start, summary }) =>
          this.calendarEventKey(summary, start, end),
        ),
      ),
    );
  }

  // 🌎 Public Methods

  /**
   * The key an event is told apart by within one observer's upsert: its
   * summary and the instants it starts and ends, the natural key less the
   * coordinates every event in the upsert shares. A boundary and a span may
   * share a title and a start, so the end tells them apart.
   */
  calendarEventKey(
    summary: string,
    start: Date | Moment,
    end: Date | Moment,
  ): string {
    return `${summary}\u0000${start.toISOString()}\u0000${end.toISOString()}`;
  }

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
   * A coordinate rounded to the decimals the column stores, as the text the
   * column holds, so what is written and what is looked up compare exactly.
   */
  formatCoordinate(coordinate: number): string {
    return coordinate.toFixed(COORDINATE_DECIMAL_PLACES);
  }

  /**
   * The id each stored row is stored under, by {@link calendarEventKey}, from
   * the summary, start and end each row reads back with its id, so the order
   * SQLite answers in does not matter. Only the rows whose key is in `wanted`
   * are included, as the select that reads them back also finds neighbors.
   */
  mapWrittenIds(
    stored: readonly Pick<CalendarEvent, "end" | "id" | "start" | "summary">[],
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
   * Text with no leading or trailing whitespace and each run of whitespace
   * inside it collapsed to one space, so a title never begins with a space or
   * carries a double one, whatever a detector built it from.
   */
  tidyText(text: string): string {
    return text.replaceAll(/\s+/gu, " ").trim();
  }

  /**
   * The links a written batch of events makes to the tag tree: one for each
   * path each event is classified under, to the node `tagIds` resolved it to,
   * each pair once. Throws for an event the write did not read back an id
   * for, or a path `tagIds` lacks, either of which would lose its tags.
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
          observer,
        );
        await this.replaceTagLinks(
          manager,
          [...ids.values()],
          this.toTagLinks(batch, ids, tagIds),
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
