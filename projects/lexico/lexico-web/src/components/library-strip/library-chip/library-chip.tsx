import { ArrowLeft, ArrowRight, EllipsisVertical, X } from "lucide-react";
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
 * One chip of a strip: its icon and wording, an optional action for a click on its label, and what its menu does to move or remove it.
 */
export interface LibraryChipProperties {
  /** The aria-label of the label button, when it has an action. */
  activateLabel?: string;
  className?: string;
  icon?: LucideIcon | undefined;
  /** Whether the chip leads its strip, so it cannot move left. */
  isFirst: boolean;
  /** Whether the chip ends its strip, so it cannot move right. */
  isLast: boolean;
  label: string;
  /** What a click on the label does; without it the label is plain text. */
  onActivate?: () => void;
  /** Called with -1 or 1 when the menu moves the chip left or right. */
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
  /** Shown after the label, such as a sort's direction arrow. */
  trailing?: ReactNode;
}

// 🧩 Component

/**
 * A chip that joins its neighbors in a strip: the icon and label, then a permanent ellipsis segment whose menu moves the chip left or right, or removes it.
 */
export function LibraryChip(
  properties: Readonly<LibraryChipProperties>,
): ReactNode {
  const {
    activateLabel,
    className,
    icon,
    isFirst,
    isLast,
    label,
    onActivate,
    onMove,
    onRemove,
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
      {onActivate === undefined ? (
        <div
          className={LIBRARY_TEXT_SEGMENT}
          data-slot="button"
        >
          {content}
        </div>
      ) : (
        <Button
          aria-label={activateLabel}
          onClick={() => {
            onActivate();
          }}
          type="button"
          variant="outline"
        >
          {content}
        </Button>
      )}
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
