import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { DataSource } from "typeorm";

import {
  postgresConnection,
  postgresDataSourceOptions,
  postgresEnvironment,
} from "../../src/modules/postgresql/postgresql.utilities";

import {
  POSTGRES_CONTAINER_IMAGES,
  POSTGRES_CONTAINER_INITIALIZATION_PATH,
} from "./postgres-container.constants";

import type { PostgresConnection } from "../../src/modules/postgresql/postgresql.types";
import type {
  PostgresContainerOptions,
  StartedPostgresContainer,
} from "./postgres-container.types";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";

// 🌎 Utilities

/**
 * Starts a throwaway Postgres 18 with the local layout and the project's real
 * migrations. Resolves with the role's connection, never the admin login.
 */
export async function startPostgresContainer({
  images = POSTGRES_CONTAINER_IMAGES,
  migrations,
  project,
}: PostgresContainerOptions): Promise<StartedPostgresContainer> {
  const layout = postgresConnection({
    environment: {},
    project,
  });
  const database = `${project}_testing`;
  const container = await startFirstAvailableImage(images, {
    ...layout,
    database,
  });
  const connection: PostgresConnection = {
    ...layout,
    database,
    host: container.getHost(),
    port: container.getPort(),
  };

  // 🎯 Migrated as the project's role, then disconnected; inline rather
  // than a helper so a suite's call stack stays within the depth limit.
  const dataSource = new DataSource(
    postgresDataSourceOptions(connection, { entities: [], migrations }),
  );

  try {
    await dataSource.initialize();

    try {
      await dataSource.runMigrations({ transaction: "each" });
    } finally {
      await dataSource.destroy();
    }
  } catch (error) {
    await container.stop();
    throw error;
  }

  return {
    connection,
    environment: postgresEnvironment({ connection, project }),
    stop: async (): Promise<void> => {
      await container.stop();
    },
  };
}

/**
 * The SQL the image runs on first start: the role, database, and schema the
 * local Docker init creates, for testing.
 */
function postgresInitializationSql(connection: PostgresConnection): string {
  return [
    `CREATE ROLE ${connection.username} LOGIN PASSWORD '${connection.password}';`,
    `CREATE DATABASE ${connection.database} OWNER ${connection.username};`,
    String.raw`\connect ${connection.database}`,
    `CREATE SCHEMA ${connection.schema} AUTHORIZATION ${connection.username};`,
    "",
  ].join("\n");
}

/**
 * Starts the first image that will start, so a Docker Hub rate limit falls
 * through to the mirror rather than failing the suite.
 */
async function startFirstAvailableImage(
  images: readonly string[],
  layout: PostgresConnection,
): Promise<StartedPostgreSqlContainer> {
  const initializationSql = postgresInitializationSql(layout);
  const failures: string[] = [];

  for (const image of images) {
    try {
      return await new PostgreSqlContainer(image)
        .withCopyContentToContainer([
          {
            content: initializationSql,
            target: POSTGRES_CONTAINER_INITIALIZATION_PATH,
          },
        ])
        .start();
    } catch (error) {
      failures.push(`${image}: ${String(error)}`);
    }
  }

  throw new Error(
    `Unable to start a Postgres test container. ${failures.join("; ")}`,
  );
}
