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
 * Starts a migrated `caelundas_testing` database through the shared
 * `startDatabaseTestingModule`, connected the way the command line connects:
 * through `CaelundasDatabaseModule`, from `CAELUNDAS_POSTGRES_*` alone,
 * validated by the CLI's own environment schema. Its variables stay on
 * `process.env` until `close`, so an application context a test boots
 * afterwards connects to the same database.
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
