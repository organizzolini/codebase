import type { TagTreeRow } from "../../types/event-filter-tag-tree.types";
import type { FilterEditorProps } from "@codebase/presentation";
import type { KeyboardEvent } from "react";

// 🏷️ Types

/**
 * What the tag picker reads from the builder's editor properties.
 */
export type UseTagPickerProperties = Pick<
  FilterEditorProps,
  "cancel" | "commit" | "field" | "onValueChange" | "options" | "value"
> & {
  /**
   * Whether picking a tag picks everything beneath it and a tag with only
   * some of its tags picked is shown partly picked; on when absent.
   */
  cascade?: boolean | undefined;
};

/**
 * What the tag picker draws and does: the rows to list, and how a tick, a
 * handle and a key change the rule or the folding.
 */
export interface UseTagPickerResult {
  handleOpen: (id: string, open: boolean) => void;
  handleOptionKeyDown: (
    event: KeyboardEvent<HTMLElement>,
    row: TagTreeRow,
  ) => void;
  handleSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleToggle: (id: string) => void;
  /**
   * The tags to list, in tree order, with their folding and ticks.
   */
  rows: TagTreeRow[];
}
