import moment from "moment-timezone";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import {
  CAELUNDAS_DATABASE_MIGRATIONS,
  DATABASE_ENTITIES,
} from "../../data-source.constants";
import { DatabaseModule } from "../../database.module";

import { CalendarEvent } from "./calendar-event.entity";

import type { DatabaseTestingModule } from "@codebase/persistence/testing";

/** Starting Postgres and running the migration takes longer than a test. */
const CONTAINER_TIMEOUT_MILLISECONDS = 120_000;

/** The generated columns of one event, as the database stores them. */
interface LocalTimeRow {
  end_local_day: string;
  start_local_day: string;
  start_local_hour: number;
}

/**
 * Inserts events on a throwaway Postgres migrated by the real migration and
 * asserts the stored generated columns hold each event's local day and hour.
 */
describe(CalendarEvent, () => {
  let database: DatabaseTestingModule;

  /** Saves one event without naming the generated columns. */
  async function save(
    start: string,
    end: string,
    timezone: string,
  ): Promise<CalendarEvent> {
    return database.repository(CalendarEvent).save(
      database.repository(CalendarEvent).create({
        end: moment.utc(end),
        latitude: "40.712800",
        longitude: "-74.006000",
        name: "Mars Retrograde",
        note: "Mars stations retrograde",
        start: moment.utc(start),
        timezone,
      }),
    );
  }

  /** Reads the generated columns of one event as text. */
  async function readLocalTime(id: string): Promise<LocalTimeRow | undefined> {
    const [row] = await database.dataSource.query<LocalTimeRow[]>(
      `select start_local_day::text, end_local_day::text, start_local_hour
       from calendar_events where id = $1`,
      [id],
    );

    return row;
  }

  beforeAll(async () => {
    database = await startDatabaseTestingModule({
      database: DatabaseModule,
      entities: [...DATABASE_ENTITIES],
      migrations: [...CAELUNDAS_DATABASE_MIGRATIONS],
      project: "caelundas",
    });
  }, CONTAINER_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    await database.dataSource.query(
      "truncate calendar_event_tags, calendar_events cascade",
    );
  });

  afterAll(async () => {
    await database.close();
  }, CONTAINER_TIMEOUT_MILLISECONDS);

  it("fills the local day and hour of an event in America/New_York on insert", async () => {
    expect.hasAssertions();

    const event = await save(
      "2026-03-05T03:30:00Z",
      "2026-03-05T05:00:00Z",
      "America/New_York",
    );

    await expect(readLocalTime(event.id)).resolves.toStrictEqual({
      end_local_day: "2026-03-05",
      start_local_day: "2026-03-04",
      start_local_hour: 22,
    });
  });

  it("puts a start and end that fall on one UTC day onto the previous local day in a western zone", async () => {
    expect.hasAssertions();

    const event = await save(
      "2026-07-01T03:30:00Z",
      "2026-07-01T05:00:00Z",
      "America/Los_Angeles",
    );

    await expect(readLocalTime(event.id)).resolves.toStrictEqual({
      end_local_day: "2026-06-30",
      start_local_day: "2026-06-30",
      start_local_hour: 20,
    });
  });

  it("puts the same UTC day onto the next local day in an eastern zone", async () => {
    expect.hasAssertions();

    const event = await save(
      "2026-07-01T16:30:00Z",
      "2026-07-01T18:30:00Z",
      "Asia/Tokyo",
    );

    await expect(readLocalTime(event.id)).resolves.toStrictEqual({
      end_local_day: "2026-07-02",
      start_local_day: "2026-07-02",
      start_local_hour: 1,
    });
  });

  it("splits the days when the local midnight falls inside the event", async () => {
    expect.hasAssertions();

    const event = await save(
      "2026-03-05T04:00:00Z",
      "2026-03-05T06:00:00Z",
      "America/New_York",
    );

    await expect(readLocalTime(event.id)).resolves.toStrictEqual({
      end_local_day: "2026-03-05",
      start_local_day: "2026-03-04",
      start_local_hour: 23,
    });
  });

  it("keeps the columns correct when an upsert on the natural key updates the row", async () => {
    expect.hasAssertions();

    const first = await save(
      "2026-03-05T03:30:00Z",
      "2026-03-05T05:00:00Z",
      "America/New_York",
    );

    await database.dataSource.query(
      `insert into calendar_events (name, "start", "end", latitude, longitude, note, timezone)
       values ('Mars Retrograde', '2026-03-05T03:30:00Z', '2026-03-05T05:00:00Z', 40.712800, -74.006000, 'again', 'Asia/Tokyo')
       on conflict on constraint calendar_events_natural_key
       do update set note = excluded.note, timezone = excluded.timezone`,
    );

    const [count] = await database.dataSource.query<[{ count: string }]>(
      `select count(*) as count from calendar_events`,
    );

    expect(count.count).toBe("1");
    await expect(readLocalTime(first.id)).resolves.toStrictEqual({
      end_local_day: "2026-03-05",
      start_local_day: "2026-03-05",
      start_local_hour: 12,
    });
  });

  it("rejects a direct write to a generated column", async () => {
    expect.hasAssertions();

    const event = await save(
      "2026-03-05T03:30:00Z",
      "2026-03-05T05:00:00Z",
      "America/New_York",
    );

    await expect(
      database.dataSource.query(
        `update calendar_events set start_local_day = '2030-01-01' where id = $1`,
        [event.id],
      ),
    ).rejects.toThrow(/(can only be|cannot insert a non-DEFAULT)/u);
    await expect(
      database.dataSource.query(
        `insert into calendar_events (name, "start", "end", latitude, longitude, note, timezone, start_local_hour)
         values ('x', now(), now(), 1, 1, 'x', 'UTC', 3)`,
      ),
    ).rejects.toThrow(/(can only be|cannot insert a non-DEFAULT)/u);
  });
});
