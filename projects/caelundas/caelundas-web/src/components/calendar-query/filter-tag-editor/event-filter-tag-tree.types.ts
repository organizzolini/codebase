import type { FilterOption } from "@codebase/presentation";

// 🏷️ Types

/**
 * A tag's pick state: checked, partial, or unchecked.
 */
export type TagCheckState = "checked" | "partial" | "unchecked";

/**
 * A tag option's depth beneath the root, and its name.
 */
export interface TagOptionData {
  depth: number;
  name: string;
}

/**
 * Where each tag's subtree ends, and which tags are leaves.
 */
export interface TagShape {
  end: number[];
  leaf: boolean[];
}

/**
 * One tag picker row: a tag, its depth, and open state.
 */
export interface TagTreeRow {
  depth: number;
  /**
   * Whether the tag has tags beneath it to open.
   */
  hasChildren: boolean;
  isExpanded: boolean;
  item: FilterOption;
  name: string;
  /**
   * How many of the picked tags lie beneath this one, so a closed tag still
   * says there are picks inside it.
   */
  selectedBelow: number;
  /**
   * Whether the tag is picked, partly picked through the tags beneath it, or
   * not picked.
   */
  state: TagCheckState;
}
