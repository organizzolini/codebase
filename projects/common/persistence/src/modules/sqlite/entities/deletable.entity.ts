import { Column, DeleteDateColumn } from "typeorm";

import { SqliteUpdatableEntity } from "./updatable.entity";

/**
 * Adds soft deletion: when a row was deleted and, optionally, who deleted
 * it. A table without soft deletion extends {@link SqliteUpdatableEntity}
 * instead and carries no `deletedAt`.
 */
export abstract class SqliteDeletableEntity extends SqliteUpdatableEntity {
  @DeleteDateColumn({ nullable: true, type: "datetime" })
  deletedAt?: Date | null;

  @Column("text", { nullable: true })
  deletedBy?: null | string;
}
