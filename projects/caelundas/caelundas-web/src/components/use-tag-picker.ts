import { useState } from "react";

import {
  findAncestors,
  getTagStates,
  type TagTreeRow,
  toggleTag,
  toTagTreeRows,
} from "../lib/event-filters/event-filter-tag-tree";

import type { FilterEditorProps } from "@codebase/presentation";
import type { KeyboardEvent } from "react";

/**
 * What the tag picker draws and does: the rows to list, and how a tick, a
 * handle and a key change the rule or the folding.
 */
export interface TagPicker {
  handleOpen: (id: string, open: boolean) => void;
  handleOptionKeyDown: (
    event: KeyboardEvent<HTMLElement>,
    row: TagTreeRow,
  ) => void;
  handleSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleToggle: (id: string) => void;
  rows: TagTreeRow[];
}

/**
 * What each key does on a row of the list.
 */
const KEY_ACTIONS: Readonly<
  Record<string, "close" | "down" | "escape" | "open" | "toggle" | "up">
> = {
  " ": "toggle",
  ArrowDown: "down",
  ArrowLeft: "close",
  ArrowRight: "open",
  ArrowUp: "up",
  Enter: "toggle",
  Escape: "escape",
};

/**
 * Holds what the tag picker needs from the builder's editor properties: the
 * tags the rule holds, which tags are open, and the handlers that edit them.
 * The tree opens already showing the tags the rule holds; a search lists
 * every match and leaves the folding alone. Each tick is written at once,
 * with the list left open.
 */
export function useTagPicker(
  properties: Readonly<
    Pick<
      FilterEditorProps,
      "cancel" | "commit" | "field" | "onValueChange" | "options" | "value"
    > & {
      /**
       * Whether picking a tag picks everything beneath it and a tag with only
       * some of its tags picked is shown partly picked; on when absent.
       */
      cascade?: boolean | undefined;
    }
  >,
): TagPicker {
  const {
    cancel,
    cascade = true,
    commit,
    field,
    onValueChange,
    options,
    value,
  } = properties;
  // Every tag the field offers, in tree order, which a search narrows only in
  // what it lists: the tree's shape is read from the whole.
  const tree = field.options ?? options.items;
  const selected: readonly unknown[] = Array.isArray(value) ? value : [];
  const [expanded, setExpanded] = useState(() => findAncestors(tree, selected));
  const searching = options.query !== "";
  const rows = toTagTreeRows(searching ? options.items : tree, {
    expanded,
    selected,
    showAll: searching,
    ...(cascade ? { states: getTagStates(tree, selected) } : {}),
  });
  const handleToggle = (id: string): void => {
    const next = cascade
      ? toggleTag(tree, selected, id)
      : selected.includes(id)
        ? selected.filter((picked) => picked !== id)
        : [...selected, id];

    onValueChange(next);
    commit(next, { close: false });
  };
  const handleOpen = (id: string, open: boolean): void => {
    setExpanded((previous) => {
      const next = new Set(previous);

      if (open) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  };
  const handleSearchKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      focusSibling(event.currentTarget, 0);
    }
  };
  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    row: TagTreeRow,
  ): void => {
    const action = KEY_ACTIONS[event.key];

    // The right and left arrows open and close a tag, so on one with nothing
    // beneath it they are left alone.
    if (
      action === undefined ||
      ((action === "open" || action === "close") && !row.hasChildren)
    ) {
      return;
    }

    event.preventDefault();

    const { value: id } = row.item;
    const actions = {
      close: () => {
        handleOpen(id, false);
      },
      down: () => {
        focusSibling(event.currentTarget, 1);
      },
      escape: cancel,
      open: () => {
        handleOpen(id, true);
      },
      toggle: () => {
        handleToggle(id);
      },
      up: () => {
        focusSibling(event.currentTarget, -1);
      },
    };

    actions[action]();
  };

  return {
    handleOpen,
    handleOptionKeyDown,
    handleSearchKeyDown,
    handleToggle,
    rows,
  };
}

/**
 * Moves focus to the row a number of rows from an element, among the rows of
 * its list; from the search box, where the number is 0, to the first row.
 */
function focusSibling(element: HTMLElement, step: number): void {
  const scope =
    element.closest("[data-testid='filter-tag-editor']") ??
    element.parentElement;
  const rows = [
    ...(scope?.querySelectorAll<HTMLElement>("[role='option']") ?? []),
  ];
  const index = rows.indexOf(element);

  rows[index === -1 ? 0 : index + step]?.focus();
}
