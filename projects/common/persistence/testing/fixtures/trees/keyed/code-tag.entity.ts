import {
  Column,
  Entity,
  PrimaryColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";

/**
 * An adjacency-list tree with no `name` column, keyed by a text code in its
 * own schema: the label falls back to the key, and the schema is named.
 */
@Entity({ name: "code_tags", schema: "fixture" })
@Tree("adjacency-list")
export class CodeTag {
  @TreeChildren()
  children!: CodeTag[];

  @PrimaryColumn({ type: "text" })
  code!: string;

  @Column({ nullable: true, type: "text" })
  note!: null | string;

  @TreeParent()
  parent!: CodeTag | null;
}
