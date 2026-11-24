import path from "node:path";

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  startFixtureDatabase,
} from "../../../../../testing/fixture-persistence";
import { RenderEntitiesService } from "../render-entities/render-entities.service";
import { RenderOptionsService } from "../render-options/render-options.service";

import { RenderNodesService } from "./render-nodes.service";

import type { FixtureDatabase } from "../../../../../testing/fixture-persistence";
import type { GraphEntity } from "../render-entities/render-entities.types";
import type { DataSource } from "typeorm";

/** The entity files of the stations and their network. */
const GENERATED = path.join(
  import.meta.dirname,
  "../../../../../testing/fixtures/graphs/generated",
);
const GLOBS = [
  path.join(GENERATED, "network.entity.ts"),
  path.join(GENERATED, "station.entity.ts"),
];

/** More ids than one batch holds, so a read takes several queries. */
const STATION_COUNT = 1200;

describe("render nodes service, reading labels", () => {
  let source: FixtureDatabase;
  const renderEntities = new RenderEntitiesService();
  const renderOptions = new RenderOptionsService();
  const renderNodes = new RenderNodesService();

  /** Runs `read` over a data source for the station entity, then closes it. */
  async function withStations<Result>(
    read: (dataSource: DataSource, station: GraphEntity) => Promise<Result>,
  ): Promise<Result> {
    const { connection } = renderOptions.plan({
      entities: GLOBS,
      schema: "fixture",
      sourceUri: source.uri,
    });
    const entities = await renderEntities.load(GLOBS);
    const station = entities.find(({ name }) => name === "Station");
    if (station === undefined) throw new Error("No station entity");
    const dataSource = renderEntities.createDataSource(connection, entities);
    await dataSource.initialize();
    try {
      return await read(dataSource, station);
    } finally {
      await dataSource.destroy();
    }
  }

  beforeAll(async () => {
    source = await startFixtureDatabase();
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    await source.query("DROP TABLE IF EXISTS stations CASCADE");
    await source.query(
      "CREATE TABLE stations (number integer PRIMARY KEY, title text)",
    );
    await source.query(
      `INSERT INTO stations (number, title) SELECT n, CASE WHEN n = 3 THEN NULL ELSE 'Station ' || n END FROM generate_series(1, ${String(STATION_COUNT)}) AS n`,
    );
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await source.close();
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "reads only the labels asked for, a batch of ids per query",
    async () => {
      const ids = Array.from({ length: STATION_COUNT }, (_, index) =>
        String(index + 1),
      );

      const { labels, queries } = await withStations(
        async (dataSource, station) => {
          const spy = vi.spyOn(dataSource, "query");
          return {
            labels: await renderNodes.labels(
              dataSource,
              dataSource.getMetadata(station),
              ids,
            ),
            queries: spy.mock.calls.length,
          };
        },
      );

      expect(queries).toBe(3);
      expect(labels.size).toBe(STATION_COUNT - 1);
      expect(labels.get("2")).toBe("Station 2");
      expect(labels.has("3")).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "reads nothing for no ids, and nothing for an id with no row",
    async () => {
      const { missing, none } = await withStations(
        async (dataSource, station) => {
          const metadata = dataSource.getMetadata(station);
          return {
            missing: await renderNodes.labels(dataSource, metadata, ["0"]),
            none: await renderNodes.labels(dataSource, metadata, []),
          };
        },
      );

      expect(none.size).toBe(0);
      expect(missing.size).toBe(0);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
