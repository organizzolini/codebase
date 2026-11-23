import { useState } from "react";

import {
  Cascader,
  CascaderBreadcrumb,
  CascaderEmpty,
  CascaderFooter,
  CascaderInput,
  CascaderList,
  CascaderNav,
  CascaderPanel,
  CascaderStatus,
  CascaderVirtualItems,
} from "@codebase/presentation";

import { LABELS, NOTHING } from "./gallery-cascader.constants";

import type { CascaderNode } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The tree, the ticked values, the search's name, and the toggle handler.
 */
export interface GalleryCascaderProperties {
  /** The values of the ticked leaves. */
  checked: readonly string[];
  className?: string;
  /** The tree: parents holding leaves, each with a label and a description. */
  items: readonly CascaderNode[];
  /** What the search box is called, such as "Group by". */
  label: string;
  /** The most leaves that may be ticked at once. */
  max?: number;
  /** Called with the value of the leaf pressed, whether it was ticked or not. */
  onToggle: (value: string) => void;
}

// 🧩 Component

/**
 * Renders an inline cascader: a search box over nested lists, each leaf described and checked where ticked.
 */
export function GalleryCascader(
  properties: Readonly<GalleryCascaderProperties>,
): ReactNode {
  const {
    checked,
    className,
    items,
    label,
    max: maximum,
    onToggle,
  } = properties;

  // 🪝 Hooks
  const [path, setPath] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-cascader"
    >
      <Cascader
        inputValue={query}
        items={[...items]}
        labels={LABELS}
        maxHeight={260}
        onInputValueChange={setQuery}
        onOpenChange={NOTHING}
        onPathChange={setPath}
        onValueChange={(_values, details) => {
          if (details.node !== null) {
            onToggle(details.node.value);
          }
        }}
        path={path}
        searchScope="deep"
        value={[...checked]}
        inline
        multiple
        open
        {...(maximum === undefined ? {} : { max: maximum })}
      >
        <CascaderPanel>
          <CascaderNav>
            <CascaderInput placeholder={label} />
          </CascaderNav>
          <CascaderBreadcrumb />
          <CascaderEmpty />
          <CascaderList>
            <CascaderVirtualItems />
          </CascaderList>
          <CascaderFooter />
          <CascaderStatus />
        </CascaderPanel>
      </Cascader>
    </div>
  );
}
