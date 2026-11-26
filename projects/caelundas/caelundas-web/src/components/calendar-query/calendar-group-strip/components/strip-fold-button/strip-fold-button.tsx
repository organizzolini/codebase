import { UnfoldHorizontal } from "lucide-react";

import { Button } from "@codebase/presentation";

import { formatFoldCount } from "./strip-fold-button.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The strip's title, the facets folded away, and the unfold handler.
 */
export interface StripFoldButtonProperties {
  className?: string | undefined;
  /**
   * The names of the facets folded away, which the tooltip lists.
   */
  names: readonly string[];
  onUnfold: () => void;
  /**
   * The strip's title, which names what unfolds.
   */
  title: string;
}

// 🧩 Component

/**
 * Renders the second button of a folded strip, counting the facets folded away, which unfolds the strip when pressed.
 */
export function StripFoldButton(
  properties: Readonly<StripFoldButtonProperties>,
): ReactNode {
  const { className, names, onUnfold, title } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const text = formatFoldCount(names.length);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <Button
      aria-expanded="false"
      aria-label={`${text}, unfold ${title}`}
      className={className}
      data-testid="strip-fold-button"
      onClick={onUnfold}
      size="sm"
      title={names.join(", ")}
      variant="outline"
    >
      <UnfoldHorizontal aria-hidden="true" />
      {text}
    </Button>
  );
}
