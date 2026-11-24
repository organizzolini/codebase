import {
  Column,
  Entity,
  PrimaryColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";

/** A tree in the closure-table storage: one row per node, plus its closure table. */
@Entity({ name: "closure_tags" })
@Tree("closure-table")
export class ClosureTag {
  @TreeChildren()
  children!: ClosureTag[];

  @PrimaryColumn({ type: "integer" })
  id!: number;

  @Column({ type: "text" })
  name!: string;

  @TreeParent()
  parent!: ClosureTag | null;
}
