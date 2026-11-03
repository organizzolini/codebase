import { Column, CreateDateColumn } from "typeorm";

import { SqliteIdentifiableEntity } from "./identifiable.entity";

/**
 * Adds when a row was created and, optionally, who created it.
 *
 * Timestamps are `datetime` columns, which SQLite stores as UTC text in
 * `YYYY-MM-DD HH:MM:SS` form, with fractional seconds when the application
 * supplies them. That is ISO 8601 with a space for the `T`, sorts as text,
 * and is what SQLite's own date functions and TypeORM's `CURRENT_TIMESTAMP`
 * updates write, so every writer agrees on one format. TypeORM returns a
 * `Date` for each.
 */
export abstract class SqliteCreatableEntity extends SqliteIdentifiableEntity {
  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;

  /** Set by the application, and left empty by a writer with no user identity. */
  @Column("text", { nullable: true })
  createdBy?: null | string;
}
