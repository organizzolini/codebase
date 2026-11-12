import {
  CAELUNDAS_DATABASE_ENTITIES,
  CAELUNDAS_DATABASE_MIGRATIONS,
  CAELUNDAS_PROJECT,
  CaelundasDatabaseModule,
} from "@codebase/caelundas-db";
import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import { environmentSchema } from "../src/caelundas-cli.constants";

import type {
  DatabaseTestingModule,
  DatabaseTestingModuleOptions,
} from "@codebase/persistence/testing";

/** Starting Postgres and running the migration takes longer than a test. */
export const DATABASE_TIMEOUT_MILLISECONDS = 120_000;

/**
 * Starts a migrated database through `CaelundasDatabaseModule`, configured from `CAELUNDAS_POSTGRES_*` only. Variables stay on `process.env` until `close`, so later contexts reach it.
 */
export async function startCaelundasDatabase(
  imports: DatabaseTestingModuleOptions["imports"] = [],
): Promise<DatabaseTestingModule> {
  return startDatabaseTestingModule({
    database: CaelundasDatabaseModule,
    entities: [...CAELUNDAS_DATABASE_ENTITIES],
    imports,
    migrations: [...CAELUNDAS_DATABASE_MIGRATIONS],
    project: CAELUNDAS_PROJECT,
    validate: (config) => environmentSchema.parse(config),
  });
}
