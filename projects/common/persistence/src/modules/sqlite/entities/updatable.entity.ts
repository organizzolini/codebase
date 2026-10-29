import { Column, UpdateDateColumn } from "typeorm";

import { SqliteCreatableEntity } from "./creatable.entity";

/** Adds when a row was last updated and, optionally, who updated it. */
export abstract class SqliteUpdatableEntity extends SqliteCreatableEntity {
  @UpdateDateColumn({ type: "datetime" })
  updatedAt!: Date;

  @Column("text", { nullable: true })
  updatedBy?: null | string;
}
