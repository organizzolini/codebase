import {
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
 * The search prompt, and whether branches open in columns to the right.
 */
export interface QueryCascaderPanelProperties {
  isColumns: boolean;
  placeholder: string;
}

// 🧩 Component

/**
 * Renders the inside of a Cascader: the search box, the list or the columns, the footer's actions and the status.
 */
export function QueryCascaderPanel(
  properties: Readonly<QueryCascaderPanelProperties>,
): ReactNode {
  const { isColumns, placeholder } = properties;

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
      <CascaderEmpty />
      {isColumns ? (
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
