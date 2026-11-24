import {
  Column,
  Entity,
  PrimaryColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";

/** A tree in the adjacency-list storage, where each row names its parent column. */
@Entity({ name: "list_tags" })
@Tree("adjacency-list")
export class ListTag {
  @TreeChildren()
  children!: ListTag[];

  @PrimaryColumn({ type: "integer" })
  id!: number;

  @Column({ type: "text" })
  name!: string;

  @TreeParent()
  parent!: ListTag | null;
}
