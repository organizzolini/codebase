import { createSqliteDataSource } from "@codebase/persistence";

import {
  CAELUNDAS_DATABASE_ENTITIES,
  CAELUNDAS_DATABASE_PROJECT,
} from "./database.constants";

/**
 * The `DataSource` the TypeORM command line reads for
 * `nx run caelundas-entities:migration:*`, built from the same options as the
 * runtime module so a generated migration matches what the applications
 * expect. It reads only `CAELUNDAS_SQLITE_DATABASE`, which names the file,
 * `caelundas.sqlite` in the working directory by default, and never
 * synchronizes.
 */
export const caelundasDataSource = createSqliteDataSource({
  entities: CAELUNDAS_DATABASE_ENTITIES,
  migrations: ["src/modules/database/migrations/*.ts"],
  project: CAELUNDAS_DATABASE_PROJECT,
});
