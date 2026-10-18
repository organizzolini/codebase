import { createDataSource } from "@codebase/persistence";

import { DATABASE_ENTITIES, DATABASE_PROJECT } from "./database.constants";

/**
 * The `DataSource` the TypeORM command line reads for the `migration`
 * targets, built from the same options the runtime module uses so a
 * generated migration matches what the application expects.
 */
export const caelundasDataSource = createDataSource({
  entities: DATABASE_ENTITIES,
  migrations: ["src/modules/database/migrations/*.ts"],
  project: DATABASE_PROJECT,
});
