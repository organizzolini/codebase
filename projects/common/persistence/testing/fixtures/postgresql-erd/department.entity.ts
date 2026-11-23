import { Column, Entity } from "typeorm";

import { PostgresqlIdentifiableEntity } from "../../../src/modules/postgresql/modules/base-entities/identifiable.entity";

/** A department table for ERD model fixtures. */
@Entity({ name: "departments" })
export class ErdDepartment extends PostgresqlIdentifiableEntity {
  @Column({ nullable: true, type: "text" })
  description!: null | string;

  @Column({ type: String })
  managerCode!: string;
}
