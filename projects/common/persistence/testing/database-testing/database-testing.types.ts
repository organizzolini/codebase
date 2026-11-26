// 🏷️ Types

import type { PostgresqlModuleOptions } from "../../src/modules/postgresql/postgresql.types";
import type {
  PostgresContainerOptions,
  StartedPostgresContainer,
} from "../postgres-container/postgres-container.types";
import type { ModuleMetadata } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import type { TypeOrmModule } from "@nestjs/typeorm";
import type {
  DataSource,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from "typeorm";

/** Connects via the project's database module or `PostgresqlModule.forRoot`. */
export interface DatabaseTestingConnection {
  /** The project's database module; absent, the helper connects itself. */
  readonly database?: NonNullable<ModuleMetadata["imports"]>[number];
}

/** A testing module connected to a migrated throwaway database. */
export interface DatabaseTestingModule {
  /** Closes the module, stops the container, and restores the environment. */
  readonly close: () => Promise<void>;

  /** The running container; `close` stops it. */
  readonly container: StartedPostgresContainer;

  /** The module's connection, as the project's role. */
  readonly dataSource: DataSource;

  /** The compiled testing module. */
  readonly module: TestingModule;

  /** The repository for `entity` on the module's connection. */
  readonly repository: <Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
  ) => Repository<Entity>;
}

/** What `startDatabaseTestingModule` is given. */
export type DatabaseTestingModuleOptions = DatabaseTestingConnection &
  DatabaseTestingModuleSettings;

/** Every option but how the testing module connects. */
export interface DatabaseTestingModuleSettings
  extends
    Omit<PostgresqlModuleOptions, "entities" | "migrations">,
    PostgresContainerOptions {
  /** Entity classes to register repositories for, and to connect. */
  readonly entities: NonNullable<
    Parameters<typeof TypeOrmModule.forFeature>[0]
  >;

  /** The modules under test, beside the database and configuration. */
  readonly imports?: ModuleMetadata["imports"];

  /** The providers under test. */
  readonly providers?: ModuleMetadata["providers"];

  /** Validates the environment as the application does; otherwise read raw. */
  readonly validate?: (
    config: Record<string, unknown>,
  ) => Record<string, unknown>;
}
