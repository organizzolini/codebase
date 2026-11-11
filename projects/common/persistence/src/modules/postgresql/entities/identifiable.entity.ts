import { PrimaryColumn } from "typeorm";

/**
 * The base every table's entity extends. A `uuid` primary key the database
 * assigns with Postgres 18's native `uuidv7()`, so ids sort by write time.
 *
 * The database generates it, since TypeORM only makes version 4 and skips
 * per-entity hooks on a bulk `insert`.
 */
export abstract class PostgresqlIdentifiableEntity {
  @PrimaryColumn({
    comment: "Primary key, a uuidv7 the database assigns on insert",
    default: () => "uuidv7()",
    type: "uuid",
  })
  id!: string;
}
