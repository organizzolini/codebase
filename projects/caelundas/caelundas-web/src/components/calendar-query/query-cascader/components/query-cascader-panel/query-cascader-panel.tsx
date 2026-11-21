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
} from "@codebase/presentation";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The search prompt, and how branches open.
 */
export interface QueryCascaderPanelProperties {
  mode: "columns" | "drill" | "tree";
  placeholder: string;
}

// 🧩 Component

/**
 * Renders the inside of a Cascader: the search box, the list or the columns, the footer's actions and the status.
 */
export function QueryCascaderPanel(
  properties: Readonly<QueryCascaderPanelProperties>,
): ReactNode {
  const { mode, placeholder } = properties;

  // 🪝 Hooks

  // 🏗 Setup

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
      {mode === "columns" ? (
        <CascaderColumns />
      ) : (
        <CascaderList>
          <CascaderVirtualItems />
        </CascaderList>
      )}
      <CascaderFooter />
      <CascaderStatus />
    </CascaderPanel>
  );
}
