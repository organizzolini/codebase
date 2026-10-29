import { createSqliteDataSource } from "@codebase/persistence";

import {
  DATABASE_DEFAULT_FILE,
  DATABASE_ENTITIES,
  DATABASE_PROJECT,
} from "./database.constants";

/**
 * The `DataSource` the TypeORM command line reads for the `migration`
 * targets, built from the same options the runtime module uses so a
 * generated migration matches what the application expects. It reads the
 * same file the application does, `CAELUNDAS_SQLITE_DATABASE` or, by
 * default, `output/database.sqlite` in the project.
 */
export const caelundasDataSource = createSqliteDataSource(
  {
    entities: DATABASE_ENTITIES,
    migrations: ["src/modules/database/migrations/*.ts"],
    project: DATABASE_PROJECT,
  },
  {
    CAELUNDAS_SQLITE_DATABASE:
      process.env["CAELUNDAS_SQLITE_DATABASE"] ?? DATABASE_DEFAULT_FILE,
  },
);
