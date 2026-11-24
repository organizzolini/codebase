import { ArrowDown, ArrowUp } from "lucide-react";
import { Fragment } from "react";

import { Button } from "@codebase/presentation";

import { ChipMenu } from "../../../calendar-group-strip/components/chip-menu/chip-menu";

import type { GroupSort } from "../../../calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { ReactNode } from "react";

// 🔖 Type

/** A sort's name, direction, flip handler, and optional menu moves. */
export interface SortChipProperties {
  direction: GroupSort["direction"];
  label: string;
  onFlip: () => void;
  onMoveLeft?: (() => void) | undefined;
  onMoveRight?: (() => void) | undefined;
  onRemove?: (() => void) | undefined;
}

// 🧩 Component

/** Renders one sort as its name and direction, which flip when pressed, with an ellipsis menu to move or remove it. */
export function SortChip(properties: Readonly<SortChipProperties>): ReactNode {
  const { direction, label, onFlip, onMoveLeft, onMoveRight, onRemove } =
    properties;

  // 🪝 Hooks

  // 🏗 Setup
  const isAscending = direction === "asc";

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <Fragment>
      <Button
        aria-label={`Sorted by ${label}, ${isAscending ? "ascending" : "descending"}; reverse`}
        className="bg-background dark:bg-input/30"
        onClick={() => {
          onFlip();
        }}
        size="sm"
        variant="outline"
      >
        {label}
        {isAscending ? (
          <ArrowUp aria-hidden="true" />
        ) : (
          <ArrowDown aria-hidden="true" />
        )}
      </Button>
      <ChipMenu
        label={label}
        onMoveLeft={onMoveLeft}
        onMoveRight={onMoveRight}
        onRemove={onRemove}
        onReverse={onFlip}
      />
    </Fragment>
  );
}
