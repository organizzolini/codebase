import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ChevronsDownUp,
  ChevronsUpDown,
  EllipsisVertical,
  Trash2,
} from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@codebase/presentation";

import type { ReactNode } from "react";

// 🔖 Type

/** What the menu is for, and its optional actions. */
export interface ChipMenuProperties {
  className?: string;
  label: string;
  onCollapseAll?: (() => void) | undefined;
  onExpandAll?: (() => void) | undefined;
  onMoveLeft?: (() => void) | undefined;
  onMoveRight?: (() => void) | undefined;
  onRemove?: (() => void) | undefined;
  onReverse?: (() => void) | undefined;
}

// 🧩 Component

/**
 * Renders an ellipsis button that opens a menu to reverse a chip, move it left or right, or remove it, and where given a way to, collapse or expand every group of a table. The button is a direct child of the strip it joins, so the strip's button group joins it too.
 */
export function ChipMenu(properties: Readonly<ChipMenuProperties>): ReactNode {
  const {
    className,
    label,
    onCollapseAll,
    onExpandAll,
    onMoveLeft,
    onMoveRight,
    onRemove,
    onReverse,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={`${label} options`}
            className={className}
            data-testid="chip-menu"
            size="sm"
            variant="outline"
          >
            <EllipsisVertical aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {onCollapseAll === undefined ? null : (
          <DropdownMenuItem
            onClick={() => {
              onCollapseAll();
            }}
          >
            <ChevronsDownUp aria-hidden="true" />
            Collapse all
          </DropdownMenuItem>
        )}
        {onExpandAll === undefined ? null : (
          <DropdownMenuItem
            onClick={() => {
              onExpandAll();
            }}
          >
            <ChevronsUpDown aria-hidden="true" />
            Expand all
          </DropdownMenuItem>
        )}
        {onReverse === undefined ? null : (
          <DropdownMenuItem
            onClick={() => {
              onReverse();
            }}
          >
            <ArrowUpDown aria-hidden="true" />
            Reverse
          </DropdownMenuItem>
        )}
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
          disabled={onRemove === undefined}
          onClick={() => {
            onRemove?.();
          }}
        >
          <Trash2 aria-hidden="true" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
