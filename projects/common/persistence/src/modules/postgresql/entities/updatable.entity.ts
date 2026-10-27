import { Column, UpdateDateColumn } from "typeorm";

import { PostgresqlCreatableEntity } from "./creatable.entity";

/** Adds when a row was last updated and, optionally, who updated it. */
export abstract class PostgresqlUpdatableEntity extends PostgresqlCreatableEntity {
  @UpdateDateColumn({
    comment: "Timestamp when the record was last updated",
    type: "timestamptz",
  })
  updatedAt!: Date;

  @Column("uuid", {
    comment: "Identifier of the user or process that last updated the record",
    nullable: true,
  })
  updatedBy?: null | string;
}
