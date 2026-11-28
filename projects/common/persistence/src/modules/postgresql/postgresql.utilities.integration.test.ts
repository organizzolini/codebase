import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { startPostgresContainer } from "@codebase/persistence/testing";

import { CreateRaceProbe1767225700000 } from "../../../testing/fixtures/migrations/1767225700000-create-race-probe";
import { Break1767225800000 } from "../../../testing/fixtures/migrations/1767225800000-break";

import { MigrationFailedError } from "./postgresql.constants";
import {
  openDataSource,
  postgresDataSourceOptions,
} from "./postgresql.utilities";

import type { StartedPostgresContainer } from "@codebase/persistence/testing";

// 🧪 Tests

/** Starting Postgres takes longer than a test. */
const CONTAINER_TIMEOUT_MILLISECONDS = 120_000;

/**
 * Two instances starting at once on a fresh database, as two replicas of an
 * application do: the transaction-scoped advisory lock must let exactly one
 * migrate and the other find nothing to apply, with no error from either.
 */
describe(openDataSource, () => {
  let container: StartedPostgresContainer;

  beforeAll(async () => {
    container = await startPostgresContainer({
      migrations: [],
      project: "race",
    });
  }, CONTAINER_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await container.stop();
  });

  it("migrates once when two instances start together", async () => {
    const options = postgresDataSourceOptions(container.connection, {
      entities: [],
      migrations: [CreateRaceProbe1767225700000],
    });

    const sources = await Promise.all([
      openDataSource(options),
      openDataSource(options),
    ]);
    const rows = await sources[0].query<{ name: string }[]>(
      `select name from migrations`,
    );
    await Promise.all(sources.map(async (source) => source.destroy()));

    expect(rows).toStrictEqual([{ name: "CreateRaceProbe1767225700000" }]);
  });

  it("applies nothing when the next instance starts", async () => {
    const source = await openDataSource(
      postgresDataSourceOptions(container.connection, {
        entities: [],
        migrations: [CreateRaceProbe1767225700000],
      }),
    );
    const rows = await source.query<{ count: string }[]>(
      `select count(*) from migrations`,
    );
    await source.destroy();

    expect(rows[0]?.count).toBe("1");
  });

  it("throws a MigrationFailedError and leaves the failed migration unrecorded", async () => {
    const options = postgresDataSourceOptions(container.connection, {
      entities: [],
      migrations: [CreateRaceProbe1767225700000, Break1767225800000],
    });

    await expect(openDataSource(options)).rejects.toBeInstanceOf(
      MigrationFailedError,
    );

    const source = new DataSource(options);
    await source.initialize();
    const rows = await source.query<{ count: string }[]>(
      `select count(*) from migrations`,
    );
    await source.destroy();

    expect(rows[0]?.count).toBe("1");
  });
});
