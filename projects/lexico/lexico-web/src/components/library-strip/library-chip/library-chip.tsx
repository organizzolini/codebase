import { GripVertical, X } from "lucide-react";
import { createElement } from "react";

import {
  Button,
  cn,
  SortableItem,
  SortableItemHandle,
} from "@codebase/presentation";

import {
  LIBRARY_CHIP_CONTROL,
  LIBRARY_CHIP_ICON_FADE,
  LIBRARY_CHIP_REVEAL,
  LIBRARY_TEXT_SEGMENT,
} from "./library-chip.constants";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * One chip of a sortable strip: its identity, icon, and wording, what its cross removes, and an optional action for a click on its label.
 */
export interface LibraryChipProperties {
  /** The aria-label of the label button, when it has an action. */
  activateLabel?: string;
  className?: string;
  icon?: LucideIcon | undefined;
  label: string;
  /** What a click on the label does; without it the label is plain text. */
  onActivate?: () => void;
  onRemove: () => void;
  removeLabel: string;
  /** Shown after the label, such as a sort's direction arrow. */
  trailing?: ReactNode;
  /** The id the chip is ordered by, unique in its strip. */
  value: string;
}

// 🧩 Component

/**
 * A draggable chip that joins its neighbors in a strip: the icon and label, with a grip on the left and a cross on the right that appear on hover and keyboard focus.
 */
export function LibraryChip(
  properties: Readonly<LibraryChipProperties>,
): ReactNode {
  const {
    activateLabel,
    className,
    icon,
    label,
    onActivate,
    onRemove,
    removeLabel,
    trailing,
    value,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const content = (
    <>
      {icon === undefined ? (
        <span className="size-4" />
      ) : (
        createElement(icon, {
          "aria-hidden": true,
          className: LIBRARY_CHIP_ICON_FADE,
        })
      )}
      {label}
      {trailing}
      <X
        aria-hidden="true"
        className="invisible"
      />
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
      <SortableItem
        className="group/chip relative flex flex-1"
        render={<div />}
        role="group"
        tabIndex={-1}
        value={value}
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
        <div className="pointer-events-none absolute inset-x-2.5 inset-y-0 flex items-center justify-between">
          <SortableItemHandle
            render={
              <Button
                aria-label={`Reorder ${label}`}
                className={cn(LIBRARY_CHIP_CONTROL, LIBRARY_CHIP_REVEAL)}
                size="xs"
                type="button"
                variant="ghost"
              />
            }
          >
            <GripVertical aria-hidden="true" />
          </SortableItemHandle>
          <Button
            aria-label={removeLabel}
            className={cn(LIBRARY_CHIP_CONTROL, LIBRARY_CHIP_REVEAL)}
            onClick={() => {
              onRemove();
            }}
            size="xs"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      </SortableItem>
    </div>
  );
}
