import moment from "moment-timezone";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import {
  CAELUNDAS_DATABASE_MIGRATIONS,
  DATABASE_ENTITIES,
} from "./data-source.constants";
import { DatabaseModule } from "./database.module";
import { DatabaseService } from "./database.service";
import { CalendarEvent } from "./modules/calendar-events/calendar-event.entity";

import type { DatabaseTestingModule } from "@codebase/persistence/testing";
import type { Repository } from "typeorm";

// 🧪 Tests

/** Starting Postgres and running the migration takes longer than a test. */
const CONTAINER_TIMEOUT_MILLISECONDS = 120_000;

const UUID_V7 =
  /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/u;

const NATURAL_KEY = ["summary", "start", "end", "latitude", "longitude"];

/**
 * Boots the real `DatabaseModule` from configuration alone, the way
 * an application does, against a throwaway Postgres container migrated by the
 * project's real migration, and asserts the schema that migration builds and
 * the way entities read and write it.
 */
describe(DatabaseModule, () => {
  let database: DatabaseTestingModule;
  let events: Repository<CalendarEvent>;

  const detected = (overrides: Partial<CalendarEvent> = {}): CalendarEvent =>
    Object.assign(new CalendarEvent(), {
      description: "Mars stations retrograde",
      end: moment.utc("2026-03-04T15:20:00.000Z"),
      latitude: "40.712800",
      longitude: "-74.006000",
      start: moment.utc("2026-03-04T14:00:00.000Z"),
      summary: "Mars Retrograde",
      timezone: "America/New_York",
      ...overrides,
    });

  beforeAll(async () => {
    database = await startDatabaseTestingModule({
      database: DatabaseModule,
      entities: [...DATABASE_ENTITIES],
      migrations: [...CAELUNDAS_DATABASE_MIGRATIONS],
      project: "caelundas",
    });
    events = database.repository(CalendarEvent);
  }, CONTAINER_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await database.close();
  });

  it("connects as the caelundas role to the caelundas schema", () => {
    expect.hasAssertions();

    expect(database.module.get(DatabaseService).isConnected()).toBe(true);
    expect(database.container.connection.schema).toBe("caelundas");
    expect(database.container.connection.username).toBe("caelundas_username");
  });

  it("creates every table, derived table and the view the entities describe, and nothing else", async () => {
    expect.hasAssertions();

    const relations = await database.dataSource.query<{ name: string }[]>(
      `select table_name as name from information_schema.tables where table_schema = $1 order by table_name`,
      [database.container.connection.schema],
    );

    expect(relations.map(({ name }) => name)).toStrictEqual([
      "calendar_event_derived_times",
      "calendar_event_tag_nodes",
      "calendar_event_tags",
      "calendar_events",
      "constellation_edges",
      "constellations",
      "migrations",
      "stars",
      "tag_nodes",
      "tags",
      "tags_closure",
      "typeorm_metadata",
    ]);
  });

  it("has replaced constellation_lines with constellation_edges, its constraints named as the entity names them", async () => {
    expect.hasAssertions();

    const tables = await database.dataSource.query<{ name: string }[]>(
      String.raw`select table_name as name from information_schema.tables where table_schema = $1 and table_name like 'constellation\_%'`,
      [database.container.connection.schema],
    );
    const constraints = await database.dataSource.query<{ name: string }[]>(
      `select constraint_name as name from information_schema.table_constraints where table_schema = $1 and table_name = 'constellation_edges'`,
      [database.container.connection.schema],
    );

    expect(tables).toStrictEqual([{ name: "constellation_edges" }]);
    expect(constraints.map(({ name }) => name).toSorted()).toStrictEqual([
      "FK_04d68e2ee86feb8798df9881158",
      "FK_b82df4a773517d7ddf1b8b8df14",
      "FK_d952356fc9daa4133c753105b3c",
      "PK_a32e2be764ccbe09e19f10384f1",
      "constellation_edges_constellation_designation_not_null",
      "constellation_edges_from_hip_not_null",
      "constellation_edges_to_hip_not_null",
    ]);
  });

  it("gives the role the caelundas search_path without any startup parameter, as behind PgBouncer", async () => {
    expect.hasAssertions();

    const roles = await database.dataSource.query<{ config: string[] }[]>(
      `select rolconfig as config from pg_roles where rolname = 'caelundas_username'`,
    );

    expect(roles[0]?.config).toContain("search_path=caelundas");
  });

  it("matches the entities exactly, so a later migration:generate has nothing to add", async () => {
    expect.hasAssertions();

    const { upQueries } = await database.dataSource.driver
      .createSchemaBuilder()
      .log();

    expect(upQueries.map(({ query }) => query)).toStrictEqual([]);
  });

  it("gives every row a uuidv7 id the database assigned", async () => {
    expect.hasAssertions();

    const saved = await events.save(detected({ summary: "uuid check" }));

    expect(saved.id).toMatch(UUID_V7);
  });

  it("stores instants as timestamptz and coordinates as numeric, read back as a Moment in UTC and as text", async () => {
    expect.hasAssertions();

    await events.save(detected({ summary: "round trip" }));
    const read = await events.findOneByOrFail({ summary: "round trip" });
    const [column] = await database.dataSource.query<
      { latitude: string; start: string }[]
    >(
      `select pg_typeof("start")::text as start, pg_typeof(latitude)::text as latitude from calendar_events limit 1`,
    );

    expect(column).toStrictEqual({
      latitude: "numeric",
      start: "timestamp with time zone",
    });
    expect(moment.isMoment(read.start)).toBe(true);
    expect(read.start.toISOString()).toBe("2026-03-04T14:00:00.000Z");
    expect(read.latitude).toBe("40.712800");
    expect(read.longitude).toBe("-74.006000");
  });

  it("upserts a re-detected event on its natural key rather than minting a duplicate", async () => {
    expect.hasAssertions();

    const first = await events.upsert(
      [detected({ summary: "natural key" })],
      NATURAL_KEY,
    );
    await events.upsert(
      [detected({ description: "revised", summary: "natural key" })],
      NATURAL_KEY,
    );

    const rows = await events.findBy({ summary: "natural key" });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.description).toBe("revised");
    expect(rows[0]?.id).toBe(first.identifiers[0]?.["id"]);
  });

  it("keeps an event for a second place as a row of its own", async () => {
    expect.hasAssertions();

    await events.upsert(
      [
        detected({ summary: "two places" }),
        detected({
          latitude: "51.500000",
          longitude: "0.000000",
          summary: "two places",
        }),
      ],
      NATURAL_KEY,
    );

    await expect(events.countBy({ summary: "two places" })).resolves.toBe(2);
  });
});
