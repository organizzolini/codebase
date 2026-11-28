import {
  Column,
  Entity,
  PrimaryColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";

/**
 * An adjacency-list tree whose rows carry an icon, a note, and a rank, the
 * properties a tree read draws icons and notes from and orders siblings by.
 */
@Entity({ name: "ranked_tags" })
@Tree("adjacency-list")
export class RankedTag {
  @TreeChildren()
  children!: RankedTag[];

  @Column({ nullable: true, type: "text" })
  icon!: null | string;

  @PrimaryColumn({ type: "integer" })
  id!: number;

  @Column({ type: "text" })
  name!: string;

  @Column({ nullable: true, type: "text" })
  note!: null | string;

  @TreeParent()
  parent!: null | RankedTag;

  @Column({ type: "integer" })
  rank!: number;
}
