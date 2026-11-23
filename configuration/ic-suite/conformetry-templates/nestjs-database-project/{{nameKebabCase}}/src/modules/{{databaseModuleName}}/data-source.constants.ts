import "reflect-metadata";

import { createDataSource } from "@codebase/persistence";

export const {{databaseEntitiesConstant}} = [] as const;

export const {{databaseProject}}DataSource = createDataSource({
  entities: [...{{databaseEntitiesConstant}}],
  migrations: ["migrations/*.ts"],
  project: {{databaseProjectExpression}},
});
