import { Column, DeleteDateColumn } from "typeorm";

import { PostgresqlUpdatableEntity } from "./updatable.entity";

/**
 * Adds soft deletion: when a row was deleted and, optionally, who deleted
 * it. A table without soft deletion extends {@link PostgresqlUpdatableEntity} instead
 * and carries no `deletedAt`.
 */
export abstract class PostgresqlDeletableEntity extends PostgresqlUpdatableEntity {
  @DeleteDateColumn({
    comment: "Timestamp when the record was soft-deleted",
    nullable: true,
    type: "timestamptz",
  })
  deletedAt?: Date | null;

  @Column("uuid", {
    comment: "Identifier of the user or process that soft-deleted the record",
    nullable: true,
  })
  deletedBy?: null | string;
}
