import { useState } from "react";

import {
  Cascader,
  CascaderEmpty,
  CascaderFooter,
  CascaderInput,
  CascaderList,
  CascaderNav,
  CascaderPanel,
  CascaderStatus,
  CascaderVirtualItems,
} from "@codebase/presentation";

import { LABELS, NOTHING } from "./query-cascader.constants";

import type { CascaderNode } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The nested choices, the ones picked, the search prompt, and the change handler.
 */
export interface QueryCascaderProperties {
  className?: string;
  items: readonly CascaderNode[];
  /**
   * Whether several can be picked, with a branch ticking all beneath it; one when absent.
   */
  multiple?: boolean;
  onValueChange: (value: string[]) => void;
  placeholder: string;
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
    className,
    items,
    multiple = false,
    onValueChange,
    placeholder,
    value,
  } = properties;

  // 🪝 Hooks
  const [query, setQuery] = useState("");

  // 🏗 Setup
  const panel = (
    <CascaderPanel>
      <CascaderNav>
        <CascaderInput placeholder={placeholder} />
      </CascaderNav>
      <CascaderEmpty />
      <CascaderList>
        <CascaderVirtualItems />
      </CascaderList>
      <CascaderFooter />
      <CascaderStatus />
    </CascaderPanel>
  );
  const shared = {
    indicator: multiple,
    inline: true,
    inputValue: query,
    labels: LABELS,
    maxHeight: 288,
    mode: "tree",
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
      className={className}
      data-testid="query-cascader"
    >
      {multiple ? (
        <Cascader
          {...shared}
          items={[...items]}
          onValueChange={(next) => {
            onValueChange(next);
          }}
          selectable="any"
          value={[...value]}
          cascade
          multiple
        >
          {panel}
        </Cascader>
      ) : (
        <Cascader
          {...shared}
          items={[...items]}
          onValueChange={(next) => {
            onValueChange(next === "" ? [] : [next]);
          }}
          value={value[0] ?? ""}
        >
          {panel}
        </Cascader>
      )}
    </div>
  );
}
