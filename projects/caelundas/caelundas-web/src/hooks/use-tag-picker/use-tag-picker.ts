import { useState } from "react";

import {
  findAncestors,
  getTagStates,
  toggleTag,
  toTagTreeRows,
} from "../../components/filter-tag-editor/event-filter-tag-tree.utilities";

import { KEY_ACTIONS } from "./use-tag-picker.constants";
import { focusSibling } from "./use-tag-picker.utilities";

import type { TagTreeRow } from "../../components/filter-tag-editor/event-filter-tag-tree.types";
import type {
  UseTagPickerProperties,
  UseTagPickerResult,
} from "./use-tag-picker.types";
import type { KeyboardEvent } from "react";

// 🧩 Hook

/**
 * Holds what the tag picker needs from the builder's editor properties: the
 * tags the rule holds, which tags are open, and the handlers that edit them.
 * The tree opens already showing the tags the rule holds; a search lists
 * every match and leaves the folding alone. Each tick is written at once,
 * with the list left open.
 */
export function useTagPicker(
  properties: Readonly<UseTagPickerProperties>,
): UseTagPickerResult {
  const {
    cancel,
    cascade = true,
    commit,
    field,
    onValueChange,
    options,
    value,
  } = properties;

  // 🪝 Hooks
  // Every tag the field offers, in tree order, which a search narrows only in
  // what it lists: the tree's shape is read from the whole.
  const tree = field.options ?? options.items;
  const selected: readonly unknown[] = Array.isArray(value) ? value : [];
  const [expanded, setExpanded] = useState(() => findAncestors(tree, selected));

  // 🏗 Setup
  const searching = options.query !== "";
  const rows = toTagTreeRows(searching ? options.items : tree, {
    expanded,
    selected,
    showAll: searching,
    ...(cascade ? { states: getTagStates(tree, selected) } : {}),
  });

  // 💪 Handlers
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

  // ♻️ Lifecycle

  // 🎁 Result
  return {
    handleOpen,
    handleOptionKeyDown,
    handleSearchKeyDown,
    handleToggle,
    rows,
  };
}
