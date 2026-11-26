// 🏷️ Types

/** A menu that may leave a tag out: Filter, Group, Select, Sort. */
export type TagMenuFlag =
  | "isFilterable"
  | "isGroupable"
  | "isSelectable"
  | "isSortable";

/** Whether each menu offers a tag. */
export type TagMenuFlags = Readonly<Record<TagMenuFlag, boolean>>;

/** A node's icon and note, each possibly missing. */
export interface TagMetadata {
  icon: null | string;
  note: null | string;
}
