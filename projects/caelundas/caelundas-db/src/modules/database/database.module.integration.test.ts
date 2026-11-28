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

const NATURAL_KEY = ["name", "start", "end", "latitude", "longitude"];

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
      end: moment.utc("2026-03-04T15:20:00.000Z"),
      latitude: "40.712800",
      longitude: "-74.006000",
      name: "Mars Retrograde",
      note: "Mars stations retrograde",
      start: moment.utc("2026-03-04T14:00:00.000Z"),
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

  it("creates every table the entities describe, and nothing else", async () => {
    expect.hasAssertions();

    const relations = await database.dataSource.query<{ name: string }[]>(
      `select table_name as name from information_schema.tables where table_schema = $1 order by table_name`,
      [database.container.connection.schema],
    );

    expect(relations.map(({ name }) => name)).toStrictEqual([
      "calendar_event_facts",
      "calendar_event_tags",
      "calendar_events",
      "constellation_edges",
      "constellations",
      "dimension_edges",
      "dimensions",
      "filters",
      "group_dimensions",
      "groups",
      "measures",
      "metric_expressions",
      "metric_expressions_closure",
      "metrics",
      "migrations",
      "stars",
      "tag_edges",
      "tags",
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
      "FK_037fc3e87b256f309e5cf499cde",
      "FK_0d6cd1241fe640015005c630a03",
      "FK_a7954f4db381f98e1b7a734b1c5",
      "PK_bfdda0678824ee2374f1c72f018",
      "constellation_edges_constellation_id_not_null",
      "constellation_edges_source_node_not_null",
      "constellation_edges_target_node_not_null",
    ]);
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

    const saved = await events.save(detected({ name: "uuid check" }));

    expect(saved.id).toMatch(UUID_V7);
  });

  it("stores instants as timestamptz and coordinates as numeric, read back as a Moment in UTC and as text", async () => {
    expect.hasAssertions();

    await events.save(detected({ name: "round trip" }));
    const read = await events.findOneByOrFail({ name: "round trip" });
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
      [detected({ name: "natural key" })],
      NATURAL_KEY,
    );
    await events.upsert(
      [detected({ name: "natural key", note: "revised" })],
      NATURAL_KEY,
    );

    const rows = await events.findBy({ name: "natural key" });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.note).toBe("revised");
    expect(rows[0]?.id).toBe(first.identifiers[0]?.["id"]);
  });

  it("keeps an event for a second place as a row of its own", async () => {
    expect.hasAssertions();

    await events.upsert(
      [
        detected({ name: "two places" }),
        detected({
          latitude: "51.500000",
          longitude: "0.000000",
          name: "two places",
        }),
      ],
      NATURAL_KEY,
    );

    await expect(events.countBy({ name: "two places" })).resolves.toBe(2);
  });
});
