import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { PostgresqlModule } from "../../src/modules/postgresql/postgresql.module";
import { startPostgresContainer } from "../postgres-container/postgres-container.utilities";

import type {
  DatabaseTestingModule,
  DatabaseTestingModuleOptions,
} from "./database-testing.types";
import type { TestingModule } from "@nestjs/testing";
import type { EntityTarget, ObjectLiteral, Repository } from "typeorm";

// 🌎 Utilities

/**
 * Starts a migrated Postgres for `project` and a Nest testing module connected
 * as the application connects. Pass `database` to reuse the project's module.
 */
export async function startDatabaseTestingModule({
  database,
  entities,
  imports = [],
  providers = [],
  validate,
  ...containerOptions
}: DatabaseTestingModuleOptions): Promise<DatabaseTestingModule> {
  const { project } = containerOptions;
  const container = await startPostgresContainer(containerOptions);
  const restoreEnvironment = replaceEnvironment(container.environment);
  let module: TestingModule;
  let dataSource: DataSource;

  try {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          isGlobal: true,
          ...(validate === undefined ? {} : { validate }),
        }),
        database ?? PostgresqlModule.forRoot({ entities, project }),
        TypeOrmModule.forFeature(entities),
        ...imports,
      ],
      providers,
    }).compile();
    dataSource = module.get(DataSource);
  } catch (error) {
    restoreEnvironment();
    await container.stop();
    throw error;
  }

  return {
    close: async (): Promise<void> => {
      try {
        await module.close();
      } finally {
        restoreEnvironment();
        await container.stop();
      }
    },
    container,
    dataSource,
    module,
    repository: <Entity extends ObjectLiteral>(
      entity: EntityTarget<Entity>,
    ): Repository<Entity> => dataSource.getRepository(entity),
  };
}

/**
 * Sets `environment` on `process.env`, and returns what restores the whole
 * environment as it was, removing variables added since.
 */
function replaceEnvironment(
  environment: Readonly<Record<string, string>>,
): () => void {
  const previous = { ...process.env };

  Object.assign(process.env, environment);

  return (): void => {
    for (const key of Object.keys(process.env)) {
      if (!(key in previous)) {
        Reflect.deleteProperty(process.env, key);
      }
    }

    Object.assign(process.env, previous);
  };
}
