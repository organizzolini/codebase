import "reflect-metadata";

import { createDataSource } from "@codebase/persistence";

import { DATABASE_PROJECT } from "./database.constants";

export const DATABASE_ENTITIES = [] as const;

export const databaseDataSource = createDataSource({
  entities: [...DATABASE_ENTITIES],
  migrations: ["migrations/*.ts"],
  project: DATABASE_PROJECT,
});
