// 🏷️ Types

/** A menu that may leave a tag out (Filter, Group, Select, Sort), or the default grouping. */
export type TagMenuFlag =
  | "isDefaultGroup"
  | "isFilterable"
  | "isGroupable"
  | "isSelectable"
  | "isSortable";

/** Whether each menu offers a tag, and whether the default grouping holds it. */
export type TagMenuFlags = Readonly<Record<TagMenuFlag, boolean>>;

/** A node's icon and note, each possibly missing. */
export interface TagMetadata {
  icon: null | string;
  note: null | string;
}
