import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  EllipsisVertical,
  X,
} from "lucide-react";
import { createElement } from "react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@codebase/presentation";

import { LIBRARY_TEXT_SEGMENT } from "./library-chip.constants";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * One chip of a strip: its icon and wording, a read-only label, and what its menu does to move, reverse, or remove it.
 */
export interface LibraryChipProperties {
  className?: string;
  icon?: LucideIcon | undefined;
  /** Whether the chip leads its strip, so it cannot move left. */
  isFirst: boolean;
  /** Whether the chip ends its strip, so it cannot move right. */
  isLast: boolean;
  label: string;
  /** Called with -1 or 1 when the menu moves the chip left or right. */
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
  /** Flips the chip's direction from the menu; without it the menu has no Reverse, as for a group. */
  onReverse?: () => void;
  /** Shown after the label, such as a sort's direction arrow. */
  trailing?: ReactNode;
}

// 🧩 Component

/**
 * A chip that joins its neighbors in a strip: the icon and label, then a permanent ellipsis segment whose menu moves the chip left or right, reverses it when it has a direction, or removes it.
 */
export function LibraryChip(
  properties: Readonly<LibraryChipProperties>,
): ReactNode {
  const {
    className,
    icon,
    isFirst,
    isLast,
    label,
    onMove,
    onRemove,
    onReverse,
    trailing,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const content = (
    <>
      {icon === undefined ? null : createElement(icon, { "aria-hidden": true })}
      {label}
      {trailing}
    </>
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-slot="library-chip"
      data-testid="library-chip"
    >
      <div
        className={LIBRARY_TEXT_SEGMENT}
        data-slot="button"
      >
        {content}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Options for ${label}`}
              size="icon"
              type="button"
              variant="outline"
            />
          }
        >
          <EllipsisVertical aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={isFirst}
            onClick={() => {
              onMove(-1);
            }}
          >
            <ArrowLeft aria-hidden="true" />
            Move left
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isLast}
            onClick={() => {
              onMove(1);
            }}
          >
            <ArrowRight aria-hidden="true" />
            Move right
          </DropdownMenuItem>
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
            onClick={() => {
              onRemove();
            }}
          >
            <X aria-hidden="true" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
