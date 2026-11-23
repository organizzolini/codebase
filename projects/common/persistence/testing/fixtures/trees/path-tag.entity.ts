import {
  Column,
  Entity,
  PrimaryColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";

/** A tree in the materialized-path storage, whose path column lists each row's ancestors. */
@Entity({ name: "path_tags" })
@Tree("materialized-path")
export class PathTag {
  @TreeChildren()
  children!: PathTag[];

  @PrimaryColumn({ type: "integer" })
  id!: number;

  @Column({ type: "text" })
  name!: string;

  @TreeParent()
  parent!: null | PathTag;
}
