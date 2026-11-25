import moment from "moment-timezone";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import {
  CAELUNDAS_DATABASE_MIGRATIONS,
  DATABASE_ENTITIES,
} from "../../data-source.constants";
import { DatabaseModule } from "../../database.module";
import { DatabaseService } from "../../database.service";
import { CalendarEventTag } from "../calendar-events/calendar-event-tag.entity";
import { CalendarEvent } from "../calendar-events/calendar-event.entity";
import { Tag } from "../tags/tag.entity";

import {
  RAW_METRICS_SQL,
  ROLLUP_METRICS_SQL,
  ROLLUP_TOTAL_METRICS_SQL,
} from "./calendar-event-rollups.constants";

import type { DatabaseTestingModule } from "@codebase/persistence/testing";
import type { TreeRepository } from "typeorm";

// 🧪 Tests

/** Starting Postgres and running the migrations takes longer than a test. */
const CONTAINER_TIMEOUT_MILLISECONDS = 120_000;

/** The windows each metric is checked over, as `[from, to)` local days. */
const WINDOWS: readonly (readonly [string, string])[] = [
  ["2026-03-01", "2026-04-01"],
  ["2026-03-10", "2026-03-12"],
  ["2026-01-01", "2027-01-01"],
  ["2026-05-01", "2026-06-01"],
];

type MetricRow = Record<string, null | number | string>;

/** Rounds every number, so float aggregates compare equal to the microsecond. */
function normalize(rows: readonly MetricRow[]): MetricRow[] {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        typeof value === "number" ? Math.round(value * 1e6) / 1e6 : value,
      ]),
    ),
  );
}

/**
 * Seeds events across tags, zones and days on a throwaway Postgres migrated by
 * the real migrations, refreshes the read model and the metrics views, and
 * asserts every rollup answers each metric exactly as the raw events do.
 */
describe("metrics rollups", () => {
  let database: DatabaseTestingModule;
  let service: DatabaseService;
  let tags: TreeRepository<Tag>;
  const tagged = new Map<string, Tag>();

  /** Saves one event and links it to the named tags. */
  async function addEvent(
    summary: string,
    start: string,
    end: string,
    names: readonly string[],
  ): Promise<CalendarEvent> {
    const event = await database.repository(CalendarEvent).save(
      database.repository(CalendarEvent).create({
        description: summary,
        end: moment.utc(end),
        latitude: "40.712800",
        longitude: "-74.006000",
        start: moment.utc(start),
        summary,
        timezone: "America/New_York",
      }),
    );

    for (const name of names) {
      await database.repository(CalendarEventTag).insert({
        calendarEventId: event.id,
        tagId: tagged.get(name)?.id ?? "",
      });
    }

    return event;
  }

  /** Saves a tag, beneath `parent` when one is named. */
  async function addTag(name: string, parent?: string): Promise<void> {
    const parentTag = tagged.get(parent ?? "");

    tagged.set(
      name,
      await tags.save(
        tags.create(
          parentTag === undefined ? { name } : { name, parent: parentTag },
        ),
      ),
    );
  }

  /** Rebuilds the read model, then the metrics views. */
  async function refresh(): Promise<void> {
    await service.refreshReadModel(database.dataSource.manager);
    await service.refreshMetrics(database.dataSource.manager);
  }

  /** The raw and rollup rows for a window, whole set first. */
  async function measure(
    from: string,
    to: string,
  ): Promise<{ raw: MetricRow[]; rollup: MetricRow[] }> {
    const query = database.dataSource.query.bind(database.dataSource);
    const raw = await query<MetricRow[]>(RAW_METRICS_SQL, [from, to]);
    const perTag = await query<MetricRow[]>(ROLLUP_METRICS_SQL, [from, to]);
    const total = await query<MetricRow[]>(ROLLUP_TOTAL_METRICS_SQL, [
      from,
      to,
    ]);

    return { raw: normalize(raw), rollup: normalize([...total, ...perTag]) };
  }

  beforeAll(async () => {
    database = await startDatabaseTestingModule({
      database: DatabaseModule,
      entities: [...DATABASE_ENTITIES],
      migrations: [...CAELUNDAS_DATABASE_MIGRATIONS],
      project: "caelundas",
    });
    service = database.module.get(DatabaseService);
    tags = database.dataSource.getTreeRepository(Tag);
  }, CONTAINER_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    await database.dataSource.query(
      "truncate calendar_event_tags, calendar_events, tags, tags_closure, tag_nodes, calendar_event_tag_nodes cascade",
    );
    tagged.clear();
    await addTag("Planet");
    await addTag("Mars", "Planet");
    await addTag("Retrograde", "Mars");
    await addTag("Venus", "Planet");
    await addTag("Temporality");
    await addTag("Progressive", "Temporality");
    await addTag("Aspect");
    await addTag("Phase", "Aspect");
    await addTag("Forming", "Phase");
    await addEvent(
      "Mars Retrograde",
      "2026-03-05T03:30:00Z",
      "2026-03-05T05:00:00Z",
      ["Retrograde", "Progressive"],
    );
    await addEvent(
      "Mars Retrograde",
      "2026-03-10T12:00:00Z",
      "2026-03-12T12:00:00Z",
      ["Retrograde", "Progressive"],
    );
    await addEvent(
      "Venus Station",
      "2026-03-10T00:00:00Z",
      "2026-03-10T00:00:00Z",
      ["Venus"],
    );
    await addEvent(
      "Venus Station",
      "2026-03-11T15:00:00Z",
      "2026-03-11T15:00:00Z",
      ["Venus", "Mars"],
    );
    await addEvent(
      "Overlap A",
      "2026-03-10T14:00:00Z",
      "2026-03-10T16:00:00Z",
      ["Mars"],
    );
    await addEvent(
      "Overlap B",
      "2026-03-10T15:00:00Z",
      "2026-03-10T18:00:00Z",
      ["Venus"],
    );
    await addEvent(
      "Forming Moon",
      "2026-03-10T09:00:00Z",
      "2026-03-10T10:00:00Z",
      ["Forming", "Mars"],
    );
    await addEvent(
      "Loose Event",
      "2026-03-11T01:00:00Z",
      "2026-03-11T02:00:00Z",
      [],
    );
    await addEvent(
      "Later Event",
      "2026-04-20T12:00:00Z",
      "2026-04-20T13:30:00Z",
      ["Mars"],
    );
    await refresh();
  });

  afterAll(async () => {
    await database.close();
  });

  it.each(WINDOWS)(
    "answers every metric from the rollups as the raw events do over %s to %s",
    async (from, to) => {
      expect.hasAssertions();

      const { raw, rollup } = await measure(from, to);

      expect(rollup).toStrictEqual(raw);
    },
  );

  it("measures a non-empty window, so the comparison is not vacuous", async () => {
    expect.hasAssertions();

    const { raw } = await measure("2026-03-01", "2026-04-01");

    expect(raw[0]).toMatchObject({
      covered: 2970,
      days: 4,
      events: 7,
      instants: 2,
      names: 5,
      spans: 5,
      unique_tags: 4,
    });
  });

  it("leaves out the events tagged as a phase forming or dissolving", async () => {
    expect.hasAssertions();

    const [row] = await database.dataSource.query<{ count: string }[]>(
      "select count(*) from calendar_event_facts where name = 'Forming Moon'",
    );

    expect(row?.count).toBe("0");
  });

  it("denormalizes an event's local periods and whole-second duration", async () => {
    expect.hasAssertions();

    const [row] = await database.dataSource.query<MetricRow[]>(
      `select local_day::text, local_week::text, local_month::text, local_quarter::text,
        local_year::int, local_weekday::int, local_hour::int, duration_seconds::int
      from calendar_event_facts where name = 'Mars Retrograde' order by "start" limit 1`,
    );

    expect(row).toStrictEqual({
      duration_seconds: 5400,
      local_day: "2026-03-04",
      local_hour: 22,
      local_month: "2026-03-01",
      local_quarter: "2026-01-01",
      local_week: "2026-03-02",
      local_weekday: 3,
      local_year: 2026,
    });
  });

  it("follows the events: a refresh drops a removed event and its stale rollup rows", async () => {
    expect.hasAssertions();

    await database.dataSource.query(
      "delete from calendar_events where summary = 'Later Event'",
    );
    await refresh();

    const { raw, rollup } = await measure("2026-01-01", "2027-01-01");

    expect(rollup).toStrictEqual(raw);
    await expect(
      database.dataSource.query<unknown[]>(
        "select 1 from calendar_event_day_rollups where local_day = '2026-04-20'",
      ),
    ).resolves.toHaveLength(0);
  });

  it("refreshes again with nothing changed", async () => {
    expect.hasAssertions();

    await expect(
      service.refreshMetrics(database.dataSource.manager),
    ).resolves.toBeUndefined();
  });
});
