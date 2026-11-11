import type { TagTreeRow } from "../../components/filter-tag-editor/event-filter-tag-tree.types";
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
   * Picking a tag picks everything beneath it, and partial tags show as partly picked; on when absent.
   */
  cascade?: boolean | undefined;
};

/**
 * The tag picker's rows and its tick, handle, and key handlers.
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
