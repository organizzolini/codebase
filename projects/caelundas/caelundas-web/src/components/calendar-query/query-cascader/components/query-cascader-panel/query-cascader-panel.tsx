import {
  CascaderBreadcrumb,
  CascaderColumns,
  CascaderEmpty,
  CascaderFooter,
  CascaderInput,
  CascaderList,
  CascaderNav,
  CascaderPanel,
  CascaderStatus,
  CascaderVirtualItems,
  useCascaderState,
} from "@codebase/presentation";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The search prompt, and how branches open.
 */
export interface QueryCascaderPanelProperties {
  mode: "columns" | "drill" | "tree";
  /**
   * Content drawn in place of the list when its branch is the one open, by the branch's value.
   */
  panels?: Readonly<Record<string, ReactNode>> | undefined;
  placeholder: string;
}

// 🧩 Component

/**
 * Renders the inside of a Cascader: the search box, the list or the columns, the footer's actions and the status.
 */
export function QueryCascaderPanel(
  properties: Readonly<QueryCascaderPanelProperties>,
): ReactNode {
  const { mode, panels = {}, placeholder } = properties;

  // 🪝 Hooks
  const { path, query } = useCascaderState();

  // 🏗 Setup
  const list =
    mode === "columns" ? (
      <CascaderColumns />
    ) : (
      <CascaderList>
        <CascaderVirtualItems />
      </CascaderList>
    );
  const body =
    (mode === "drill" && query === ""
      ? panels[path.at(-1) ?? ""]
      : undefined) ?? list;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <CascaderPanel>
      <CascaderNav>
        <CascaderInput placeholder={placeholder} />
      </CascaderNav>
      <CascaderBreadcrumb />
      <CascaderEmpty />
      {body}
      <CascaderFooter />
      <CascaderStatus />
    </CascaderPanel>
  );
}
