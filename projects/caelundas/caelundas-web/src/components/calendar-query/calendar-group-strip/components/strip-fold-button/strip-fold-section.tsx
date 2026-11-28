import { StripFoldButton } from "./strip-fold-button";
import { StripFoldContext } from "./strip-fold-button.constants";
import { toFoldedStrip } from "./strip-fold-button.utilities";

import type { StripFold } from "./strip-fold-button.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The chips, their fold, the names it lists, and the title.
 */
export interface StripFoldSectionProperties {
  children: ReactNode;
  fold: StripFold | undefined;
  names: readonly string[];
  title: string;
}

// 🧩 Component

/**
 * Renders a strip's chips, whose menus fold the strip, or, once folded, the one button counting them.
 */
export function StripFoldSection(
  properties: Readonly<StripFoldSectionProperties>,
): ReactNode {
  const { children, fold, names, title } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const folded = toFoldedStrip(fold, names.length);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <StripFoldContext value={fold?.onFold}>
      {folded === undefined ? (
        children
      ) : (
        <StripFoldButton
          names={names}
          onUnfold={folded.onUnfold}
          title={title}
        />
      )}
    </StripFoldContext>
  );
}
