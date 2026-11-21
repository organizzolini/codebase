import "reflect-metadata";

import { createDataSource } from "@codebase/persistence";

import { Meander } from "./meander.entity";

/** TypeORM source for migrations, reading `MEANDERAW_POSTGRES_*` variables. */
export const meanderawDataSource = createDataSource({
  entities: [Meander],
  migrations: ["migrations/*.ts"],
  project: "meanderaw",
});
