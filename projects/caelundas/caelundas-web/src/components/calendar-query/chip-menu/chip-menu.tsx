import { ArrowLeft, ArrowRight, EllipsisVertical, Trash2 } from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@codebase/presentation";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * What the menu is for, and the moves it offers; a move that is not given is left out.
 */
export interface ChipMenuProperties {
  className?: string;
  label: string;
  onMoveLeft?: (() => void) | undefined;
  onMoveRight?: (() => void) | undefined;
  onRemove: () => void;
}

// 🧩 Component

/**
 * Renders an ellipsis button that opens a menu to move a chip left or right, or remove it.
 */
export function ChipMenu(properties: Readonly<ChipMenuProperties>): ReactNode {
  const { className, label, onMoveLeft, onMoveRight, onRemove } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="chip-menu"
      style={{ display: "contents" }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`${label} options`}
              size="sm"
              variant="outline"
            >
              <EllipsisVertical aria-hidden="true" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={onMoveLeft === undefined}
            onClick={() => {
              onMoveLeft?.();
            }}
          >
            <ArrowLeft aria-hidden="true" />
            Move left
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={onMoveRight === undefined}
            onClick={() => {
              onMoveRight?.();
            }}
          >
            <ArrowRight aria-hidden="true" />
            Move right
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onRemove();
            }}
          >
            <Trash2 aria-hidden="true" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
