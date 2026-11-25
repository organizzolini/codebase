import { Button } from "@codebase/presentation";

import { DATE_PICKER_MODES } from "../../calendar-date-picker.constants";
import { listOfferedModes } from "../../calendar-date-picker.utilities";

import type { CalendarViewName } from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { DatePickerMode } from "../../calendar-date-picker.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The mode picked, the layout, and the handler for another mode.
 */
export interface DatePickerModesProperties {
  className?: string;
  mode: DatePickerMode;
  onModeChange: (mode: DatePickerMode) => void;
  /**
   * The layout whose modes show; all when absent.
   */
  view?: CalendarViewName | undefined;
}

// 🧩 Component

/**
 * Renders the strip of modes, from Day to Year, that sets how a click picks days.
 */
export function DatePickerModes(
  properties: Readonly<DatePickerModesProperties>,
): ReactNode {
  const { className, mode, onModeChange, view = "table" } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const offered = listOfferedModes(view);
  const options = DATE_PICKER_MODES.filter((option) =>
    offered.includes(option.id),
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      aria-label="Pick by"
      className={className}
      data-testid="date-picker-modes"
      role="group"
    >
      {options.map((option) => (
        <Button
          key={option.id}
          aria-pressed={option.id === mode}
          className="font-normal aria-pressed:bg-muted aria-pressed:font-medium"
          onClick={() => {
            onModeChange(option.id);
          }}
          size="xs"
          variant="ghost"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
