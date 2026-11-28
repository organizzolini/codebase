import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@codebase/presentation";

import {
  formatMonthCursor,
  getMonthCursor,
  listWeekCells,
  shiftMonthCursor,
} from "../../calendar-date-picker.utilities";

import type { DateRangeValue } from "../../calendar-date-picker.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The range picked, today's day, and the handler for a week chosen.
 */
export interface DatePickerWeeksProperties {
  className?: string;
  onSelect: (range: DateRangeValue) => void;
  range: DateRangeValue;
  today: string;
}

// 🧩 Component

/**
 * Renders a chip for each week touching a month, such as Nov 22 – 28, with arrows between months; a chip picks its week.
 */
export function DatePickerWeeks(
  properties: Readonly<DatePickerWeeksProperties>,
): ReactNode {
  const { className, onSelect, range, today } = properties;

  // 🪝 Hooks
  const [cursor, setCursor] = useState(() => getMonthCursor(range));

  // 🏗 Setup
  const cells = listWeekCells(cursor);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="date-picker-weeks"
    >
      <div className="flex items-center justify-between">
        <Button
          aria-label="Previous"
          onClick={() => {
            setCursor(shiftMonthCursor(cursor, -1));
          }}
          size="icon-sm"
          variant="ghost"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <span className="text-sm font-medium">{formatMonthCursor(cursor)}</span>
        <Button
          aria-label="Next"
          onClick={() => {
            setCursor(shiftMonthCursor(cursor, 1));
          }}
          size="icon-sm"
          variant="ghost"
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {cells.map((cell) => (
          <Button
            key={cell.range.from}
            aria-current={
              cell.range.from <= today && today <= cell.range.to
                ? "date"
                : undefined
            }
            aria-pressed={
              cell.range.from === range.from && cell.range.to === range.to
            }
            className="font-normal tabular-nums aria-[current=date]:ring-1 aria-[current=date]:ring-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
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
