import {
  Column,
  Entity,
  PrimaryColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";

/** A tree in the nested-set storage, whose bounds place each row among its ancestors. */
@Entity({ name: "set_tags" })
@Tree("nested-set")
export class SetTag {
  @TreeChildren()
  children!: SetTag[];

  @PrimaryColumn({ type: "integer" })
  id!: number;

  @Column({ type: "text" })
  name!: string;

  @TreeParent()
  parent!: null | SetTag;
}
