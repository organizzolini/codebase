import { useState } from "react";

import { Cascader } from "@codebase/presentation";

import { useScrollExpandedToTop } from "../../../hooks/use-tag-picker/hooks/use-scroll-expanded-to-top/use-scroll-expanded-to-top";

import { QueryCascaderPanel } from "./components/query-cascader-panel/query-cascader-panel";
import { LABELS, NOTHING } from "./query-cascader.constants";
import { resolveSelectable, toExpansion } from "./query-cascader.utilities";

import type { CascaderActionItem, CascaderNode } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/** Nested choices, picked ones, search prompt, and change handler. */
export interface QueryCascaderProperties {
  /**
   * Commands pinned below the list, such as opening a panel of settings.
   */
  actions?: readonly CascaderActionItem[];
  /**
   * Whether ticking a branch ticks everything beneath it, as picking several does by default; only when several can be picked.
   */
  cascade?: boolean;
  className?: string;
  /**
   * Values of the branches open at first; only as a tree.
   */
  defaultExpanded?: readonly string[];
  /**
   * Values of the branches open, when the parent keeps them; only as a tree.
   */
  expanded?: readonly string[];
  items: readonly CascaderNode[];
  /**
   * Whether branches open beneath their parent, as a tree, or in columns to the right; a tree when absent.
   */
  mode?: "columns" | "drill" | "tree";
  /**
   * Whether several can be picked, with a branch ticking all beneath it; one when absent.
   */
  multiple?: boolean;
  /**
   * Called with the branches open after one opens or closes.
   */
  onExpandedChange?: (expanded: string[]) => void;
  onValueChange: (value: string[]) => void;
  /**
   * Content drawn in place of the list when a branch is opened, by the branch's value; only when drilling.
   */
  panels?: Readonly<Record<string, ReactNode>>;
  placeholder: string;
  /** Which rows can be picked; others open their branch when pressed. */
  selectable?: ((node: CascaderNode) => boolean) | undefined;
  value: readonly string[];
}

// 🧩 Component

/**
 * Renders the nested, searchable list that the View, Group, Sort and Filter menus pick from, drawn inline in whatever opens it.
 */
export function QueryCascader(
  properties: Readonly<QueryCascaderProperties>,
): ReactNode {
  const {
    actions = [],
    multiple = false,
    cascade = multiple,
    className,
    defaultExpanded,
    expanded,
    items,
    mode = "tree",
    onExpandedChange,
    onValueChange,
    panels,
    placeholder,
    selectable,
    value,
  } = properties;

  // 🪝 Hooks
  const [query, setQuery] = useState("");
  const { reference } = useScrollExpandedToTop();

  // 🏗 Setup
  const panel = (
    <QueryCascaderPanel
      mode={mode}
      panels={panels}
      placeholder={placeholder}
    />
  );
  const expansion = toExpansion(defaultExpanded, expanded, onExpandedChange);
  const shared = {
    ...expansion,
    indicator: multiple,
    inline: true,
    inputValue: query,
    labels: LABELS,
    maxHeight: 288,
    onInputValueChange: setQuery,
    onOpenChange: NOTHING,
    open: true,
    searchScope: "deep",
  } as const;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      ref={reference}
      className={className}
      data-testid="query-cascader"
    >
      {multiple ? (
        <Cascader
          {...shared}
          actions={[...actions]}
          cascade={cascade}
          items={[...items]}
          mode={mode}
          onValueChange={(next) => {
            onValueChange(next);
          }}
          selectable={resolveSelectable(cascade, selectable)}
          value={[...value]}
          multiple
        >
          {panel}
        </Cascader>
      ) : (
        <Cascader
          {...shared}
          actions={[...actions]}
          items={[...items]}
          mode={mode}
          onValueChange={(next) => {
            onValueChange([next]);
          }}
          value={value[0] ?? ""}
        >
          {panel}
        </Cascader>
      )}
    </div>
  );
}
