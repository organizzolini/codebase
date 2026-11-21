import type {
  FilterGroup,
  RowsFilter,
} from "../filter-model/filter-model.types";
import type {
  FilterField,
  FilterNode,
  FilterQuery,
  FilterRule,
} from "@codebase/presentation";

// 🏷️ Types

/**
 * What the link holds of a filter: tree, rows, repeats.
 */
export interface FilterLink {
  filter: FilterGroup | undefined;
  repeats: number;
  rows: RowsFilter;
}

/**
 * A category branch or characteristic leaf the Filters component offers.
 */
export type GalleryFilterField = FilterField<GalleryFilterValue>;

/**
 * A condition or a nested group of them.
 */
export type GalleryFilterNode = FilterNode<GalleryFilterValue>;

/**
 * The whole tree the Filters component edits, always a group.
 */
export type GalleryFilterQuery = FilterQuery<GalleryFilterValue>;

/**
 * One condition of the Filters tree.
 */
export type GalleryFilterRule = FilterRule<GalleryFilterValue>;

/**
 * A number, flag, text, or a range maybe half typed.
 */
export type GalleryFilterValue =
  | (number | undefined)[]
  | boolean
  | number
  | string;
