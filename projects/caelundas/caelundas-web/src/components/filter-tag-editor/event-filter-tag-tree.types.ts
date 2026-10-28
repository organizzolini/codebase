import type { FilterOption } from "@codebase/presentation";

// 🏷️ Types

/**
 * Whether a tag is picked, with everything beneath it, or only some of what
 * is beneath it is, or none of it.
 */
export type TagCheckState = "checked" | "partial" | "unchecked";

/**
 * What a tag option carries beyond its label: how deep the tag sits beneath
 * its root, and its own name, which its row shows in place of the path the
 * chip is labeled with.
 */
export interface TagOptionData {
  depth: number;
  name: string;
}

/**
 * Where each tag's own tags end in the depth-first list, and which tags have
 * none beneath them.
 */
export interface TagShape {
  end: number[];
  leaf: boolean[];
}

/**
 * One row of the tag picker: a tag, where it sits, and whether it is open.
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
