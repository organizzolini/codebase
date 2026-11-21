import { Button } from "@codebase/presentation";

import { stepFontSize } from "./font-size-control.utilities";

import type { FontSize } from "./font-size-control.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties FontSizeControl accepts.
 */
export interface FontSizeControlProperties {
  className?: string;
  onChange: (size: FontSize) => void;
  size: FontSize;
}

// 🧩 Component

/**
 * Buttons that make the reader's text smaller or larger.
 */
export function FontSizeControl(
  properties: Readonly<FontSizeControlProperties>,
): ReactNode {
  const { className, onChange, size } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="font-size-control"
    >
      <Button
        disabled={size === "small"}
        onClick={() => {
          onChange(stepFontSize(size, -1));
        }}
        variant="outline"
      >
        Smaller text
      </Button>
      <Button
        disabled={size === "large"}
        onClick={() => {
          onChange(stepFontSize(size, 1));
        }}
        variant="outline"
      >
        Larger text
      </Button>
    </div>
  );
}
