import { Column, Entity, ManyToOne } from "typeorm";

import { PostgresqlIdentifiableEntity } from "../../../src/modules/postgresql/modules/base-entities/identifiable.entity";

import { ErdDepartment } from "./department.entity";

/** An employee table with a department relation. */
@Entity()
export class ErdEmployee extends PostgresqlIdentifiableEntity {
  @ManyToOne(() => ErdDepartment)
  department!: ErdDepartment;

  @Column({ type: "text" })
  name!: string;
}
