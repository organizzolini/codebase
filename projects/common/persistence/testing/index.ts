// The Postgres test helpers moved to the common testing package; this entry
// re-exports them until every consumer imports `@codebase/testing/postgres`.
export {
  POSTGRES_CONTAINER_IMAGES,
  startDatabaseTestingModule,
  startPostgresContainer,
} from "@codebase/testing/postgres";
export type {
  DatabaseTestingModule,
  DatabaseTestingModuleOptions,
  PostgresContainerOptions,
  StartedPostgresContainer,
} from "@codebase/testing/postgres";
