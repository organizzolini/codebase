import { Button } from "@codebase/presentation";

import {
  countRangeDays,
  formatRange,
} from "../../calendar-date-picker.utilities";

import type { DateRangeValue } from "../../calendar-date-picker.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The range shown, a hint, and the Today handler.
 */
export interface DatePickerFooterProperties {
  className?: string;
  /**
   * Muted text on what a layout shows of a longer span.
   */
  hint?: string | undefined;
  onToday: () => void;
  range: DateRangeValue;
}

// 🧩 Component

/**
 * Renders the range as text with its day count, a hint, and a Go to today button.
 */
export function DatePickerFooter(
  properties: Readonly<DatePickerFooterProperties>,
): ReactNode {
  const { className, hint, onToday, range } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const days = countRangeDays(range);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="date-picker-footer"
    >
      <p
        aria-live="polite"
        className="text-sm"
      >
        {formatRange(range)}
        <span className="ml-2 text-muted-foreground">
          {days === 1 ? "1 day" : `${days} days`}
        </span>
      </p>
      {hint === undefined ? null : (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      <Button
        onClick={onToday}
        size="sm"
        variant="ghost"
      >
        Go to today
      </Button>
    </div>
  );
}
