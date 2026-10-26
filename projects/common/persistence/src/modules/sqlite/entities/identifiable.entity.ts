import { PrimaryGeneratedColumn } from "typeorm";

/**
 * The SQLite twin of the Postgres `IdentifiableEntity`: a `uuid` primary key
 * held as `text`, which TypeORM generates in the application on every insert
 * path, bulk `insert` and `upsert` included.
 *
 * Postgres lets the database assign a `uuidv7()` default, but a SQLite
 * default expression cannot do the same: TypeORM can read a generated key
 * back only from `rowid`, so an `insert` with a database-generated text key
 * throws. The ids are therefore version 4 and do not sort by insertion time.
 * Nor is a bulk `insert`'s `identifiers` in the order the rows were given:
 * TypeORM reads the keys back with a select, which answers in key order.
 *
 * Postgres entities cannot be shared as they are: `uuid` and `timestamptz`
 * are not SQLite types, and TypeORM refuses them at connect time. Comments
 * are left off, since SQLite has no column comments.
 */
export abstract class SqliteIdentifiableEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;
}
