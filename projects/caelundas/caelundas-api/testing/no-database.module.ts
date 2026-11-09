import { Global, Module } from "@nestjs/common";
import { getEntityManagerToken } from "@nestjs/typeorm";

import { NO_DATABASE_ENTITY_MANAGER } from "./no-database.constants";

/**
 * Stands in for `CaelundasDatabaseModule` in a test that boots the whole
 * root module without a reachable Postgres. It provides the entity manager
 * the services inject, answering a read of stars and of figure lines from a
 * few fixtures and any other read with no rows.
 */
@Global()
@Module({
  exports: [getEntityManagerToken()],
  providers: [
    {
      provide: getEntityManagerToken(),
      useValue: NO_DATABASE_ENTITY_MANAGER,
    },
  ],
})
export class NoDatabaseModule {}
