import "reflect-metadata";

import { createDataSource } from "@codebase/persistence";

import { Meander } from "./entities/meander.entity";

/** TypeORM source for migrations, reading `MEANDERAW_POSTGRES_*` variables. */
export const meanderawDataSource = createDataSource({
  entities: [Meander],
  migrations: ["src/modules/database/migrations/*.ts"],
  project: "meanderaw",
});
