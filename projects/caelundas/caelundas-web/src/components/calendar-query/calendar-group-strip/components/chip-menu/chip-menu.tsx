import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Crosshair,
  EllipsisVertical,
  FoldHorizontal,
  Trash2,
} from "lucide-react";
import { use } from "react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@codebase/presentation";

import { StripFoldContext } from "../strip-fold-button/strip-fold-button.constants";

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
  /** Keeps this chip and removes the strip's others. */
  onOnly?: (() => void) | undefined;
  onRemove?: (() => void) | undefined;
  onReverse?: (() => void) | undefined;
}

// 🧩 Component

/**
 * Renders an ellipsis button opening a menu to reverse, move, keep only, fold or remove a chip, and collapse or expand all groups.
 */
export function ChipMenu(properties: Readonly<ChipMenuProperties>): ReactNode {
  const {
    className,
    label,
    onCollapseAll,
    onExpandAll,
    onMoveLeft,
    onMoveRight,
    onOnly,
    onRemove,
    onReverse,
  } = properties;

  // 🪝 Hooks
  // The strip's, so every chip's menu folds it.
  const onFold = use(StripFoldContext);

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
            className={`w-5 px-0 ${className ?? ""}`.trim()}
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
          disabled={onOnly === undefined}
          onClick={() => {
            onOnly?.();
          }}
        >
          <Crosshair aria-hidden="true" />
          Only
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={onFold === undefined}
          onClick={() => {
            onFold?.();
          }}
        >
          <FoldHorizontal aria-hidden="true" />
          Fold
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={onRemove === undefined}
          onClick={() => {
            onRemove?.();
          }}
          variant="destructive"
        >
          <Trash2 aria-hidden="true" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
