import { Column, CreateDateColumn } from "typeorm";

import { PostgresqlIdentifiableEntity } from "./identifiable.entity";

/** Adds when a row was created and, optionally, who created it. */
export abstract class PostgresqlCreatableEntity extends PostgresqlIdentifiableEntity {
  @CreateDateColumn({
    comment: "Timestamp when the record was created",
    type: "timestamptz",
  })
  createdAt!: Date;

  /**
   * Set by the application, and left empty by a writer with no user
   * identity, such as a command-line application.
   */
  @Column("uuid", {
    comment: "Identifier of the user or process that created the record",
    nullable: true,
  })
  createdBy?: null | string;
}
