import "reflect-metadata";

import { createDataSource } from "@codebase/persistence";

import { Meander } from "./entities/meander.entity";

/**
 * The TypeORM data source the migration command runs every configuration through.
 * It connects as the `MEANDERAW_POSTGRES_*` variables name, to the `meanderaw` schema.
 */
export const meanderawDataSource = createDataSource({
  entities: [Meander],
  migrations: ["src/modules/database/migrations/*.ts"],
  project: "meanderaw",
});
