import { Global, Module } from "@nestjs/common";
import { getEntityManagerToken } from "@nestjs/typeorm";

/**
 * Stands in for `CaelundasDatabaseModule` in a test that boots the whole
 * root module but never reads a row, so it needs no reachable Postgres.
 * It provides the entity manager the events service injects as an empty
 * object: a query that reached it would fail loudly.
 */
@Global()
@Module({
  exports: [getEntityManagerToken()],
  providers: [{ provide: getEntityManagerToken(), useValue: {} }],
})
export class NoDatabaseModule {}
