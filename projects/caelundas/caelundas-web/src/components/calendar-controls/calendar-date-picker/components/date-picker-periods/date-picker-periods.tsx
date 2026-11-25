import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@codebase/presentation";

import {
  formatGridCursor,
  getGridCursor,
  listPeriodCells,
  shiftGridCursor,
} from "../../calendar-date-picker.utilities";

import type {
  DateRangeValue,
  GridMode,
} from "../../calendar-date-picker.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The mode, the range picked, and the handler for a cell chosen.
 */
export interface DatePickerPeriodsProperties {
  className?: string;
  mode: GridMode;
  onSelect: (range: DateRangeValue) => void;
  range: DateRangeValue;
}

// 🧩 Component

/**
 * Renders a grid of months, quarters, half-years or years, with arrows between years; a cell picks its span.
 */
export function DatePickerPeriods(
  properties: Readonly<DatePickerPeriodsProperties>,
): ReactNode {
  const { className, mode, onSelect, range } = properties;

  // 🪝 Hooks
  const [cursor, setCursor] = useState(() => getGridCursor(mode, range));

  // 🏗 Setup
  const cells = listPeriodCells(mode, cursor);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="date-picker-periods"
    >
      <div className="flex items-center justify-between">
        <Button
          aria-label="Previous"
          onClick={() => {
            setCursor(shiftGridCursor(mode, cursor, -1));
          }}
          size="icon-sm"
          variant="ghost"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <span className="text-sm font-medium">
          {formatGridCursor(mode, cursor)}
        </span>
        <Button
          aria-label="Next"
          onClick={() => {
            setCursor(shiftGridCursor(mode, cursor, 1));
          }}
          size="icon-sm"
          variant="ghost"
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {cells.map((cell) => (
          <Button
            key={cell.label}
            aria-pressed={
              cell.range.from === range.from && cell.range.to === range.to
            }
            className="font-normal aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            onClick={() => {
              onSelect(cell.range);
            }}
            size="sm"
            variant="ghost"
          >
            {cell.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
