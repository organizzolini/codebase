import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { DatePickerPanel } from "./components/date-picker-panel/date-picker-panel";

import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { DateRangeValue } from "./calendar-date-picker.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The days shown, whether it is open, and its handlers.
 */
export interface CalendarDatePickerProperties {
  className?: string;
  onApply: (range: DateRangeValue) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  range: DateRangeValue;
  timeZone: string;
  /**
   * The text the picker opens from, the period's title.
   */
  title?: ReactNode;
  /**
   * Styles the title's button.
   */
  triggerClassName?: string;
  /**
   * The layout shown, which limits the modes offered.
   */
  view?: CalendarViewName | undefined;
}

// 🧩 Component

/**
 * Renders the title as a button opening a popover to pick the view's days.
 */
export function CalendarDatePicker(
  properties: Readonly<CalendarDatePickerProperties>,
): ReactNode {
  const {
    className,
    onApply,
    onOpenChange,
    open,
    range,
    timeZone,
    title,
    triggerClassName,
    view,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-date-picker"
    >
      <Popover
        onOpenChange={onOpenChange}
        open={open}
      >
        <PopoverTrigger
          render={
            <button
              className={triggerClassName}
              type="button"
            />
          }
        >
          {title}
        </PopoverTrigger>
        <PopoverContent
          aria-label="Pick dates"
          className="w-auto max-w-[95vw] gap-0 p-0"
          sideOffset={8}
        >
          <DatePickerPanel
            onApply={onApply}
            onClose={() => {
              onOpenChange(false);
            }}
            range={range}
            timeZone={timeZone}
            view={view}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
