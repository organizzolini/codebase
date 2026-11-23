import { EyeIcon } from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@codebase/presentation";

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
 * The Display button and its menu, which makes the reader's text smaller or larger.
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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
            />
          }
        >
          <EyeIcon aria-hidden="true" />
          Display
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            closeOnClick={false}
            disabled={size === "small"}
            onClick={() => {
              onChange(stepFontSize(size, -1));
            }}
          >
            Smaller text
          </DropdownMenuItem>
          <DropdownMenuItem
            closeOnClick={false}
            disabled={size === "large"}
            onClick={() => {
              onChange(stepFontSize(size, 1));
            }}
          >
            Larger text
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
