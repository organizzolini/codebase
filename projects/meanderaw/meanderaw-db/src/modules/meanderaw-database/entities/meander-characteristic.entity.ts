import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

import type { Characteristic } from "./characteristic.entity";
import type { Meander } from "./meander.entity";
import type { Relation } from "typeorm";

/**
 * One row of the `meander_characteristics` bridge: a meander and a
 * characteristic it holds. Only a true boolean (stored as 1) or a number above
 * 0 has a row, so a missing row reads as 0 or false.
 */
@Check("value > 0")
@Entity({ name: "meander_characteristics" })
@Index(["characteristicId", "value", "meanderId"])
export class MeanderCharacteristic {
  @JoinColumn({ name: "characteristic_id" })
  @ManyToOne("Characteristic", { nullable: false, onDelete: "CASCADE" })
  characteristic!: Relation<Characteristic>;

  @PrimaryColumn({ type: "smallint" })
  characteristicId!: number;

  @JoinColumn({ name: "meander_id" })
  @ManyToOne("Meander", { nullable: false, onDelete: "CASCADE" })
  meander!: Relation<Meander>;

  @PrimaryColumn({ type: "uuid" })
  meanderId!: string;

  @Column({ type: "double precision" })
  value!: number;
}
