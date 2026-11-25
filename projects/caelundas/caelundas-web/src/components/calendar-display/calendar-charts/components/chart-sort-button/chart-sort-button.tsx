import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "@codebase/presentation";

import { SORT_DIRECTIONS } from "./chart-sort-button.constants";

import type { GroupSort } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A metric's name, its sort now, and the click.
 */
export interface ChartSortButtonProperties {
  direction: GroupSort["direction"] | undefined;
  label: string;
  onClick: () => void;
}

// 🧩 Component

/**
 * Renders a small button that cycles the sort by a metric: ascending, descending, none.
 */
export function ChartSortButton(
  properties: Readonly<ChartSortButtonProperties>,
): ReactNode {
  const { direction, label, onClick } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const state =
    direction === undefined ? "not sorted" : SORT_DIRECTIONS[direction];
  const Icon =
    direction === undefined
      ? ArrowUpDown
      : direction === "asc"
        ? ArrowUp
        : ArrowDown;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <Button
      aria-label={`Sort by ${label}: ${state}`}
      data-direction={direction ?? "none"}
      data-testid="chart-sort-button"
      onClick={() => {
        onClick();
      }}
      size="icon-xs"
      title={`Sort by ${label}: ${state}`}
      type="button"
      variant={direction === undefined ? "ghost" : "secondary"}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
