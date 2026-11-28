import { useState } from "react";

import { Calendar } from "@codebase/presentation";

import { formatCalendarDate } from "../../../../calendar-display/events-calendar/components/calendar-window/calendar-window.utilities";
import {
  getLayoutHint,
  getPeriod,
  isGridMode,
  resolveMode,
  toLocalDate,
  toLocalDay,
} from "../../calendar-date-picker.utilities";
import { DatePickerFooter } from "../date-picker-footer/date-picker-footer";
import { DatePickerModes } from "../date-picker-modes/date-picker-modes";
import { DatePickerPeriods } from "../date-picker-periods/date-picker-periods";
import { DatePickerWeeks } from "../date-picker-weeks/date-picker-weeks";

import type { CalendarViewName } from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type {
  DatePickerMode,
  DateRangeValue,
} from "../../calendar-date-picker.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The range, zone, layout and handlers.
 */
export interface DatePickerPanelProperties {
  className?: string;
  onApply: (range: DateRangeValue) => void;
  onClose: () => void;
  range: DateRangeValue;
  timeZone: string;
  /**
   * The layout limiting what is offered; none when absent.
   */
  view?: CalendarViewName | undefined;
}

// 🧩 Component

/**
 * Renders mode chips over the calendar, week chips or grid of its mode; every pick applies at once.
 */
export function DatePickerPanel(
  properties: Readonly<DatePickerPanelProperties>,
): ReactNode {
  const {
    className,
    onApply,
    onClose,
    range,
    timeZone,
    view = "table",
  } = properties;

  // 🪝 Hooks
  const [pickedMode, setPickedMode] = useState<DatePickerMode>("day");
  // The first day of a range being picked, until its last is clicked.
  const [pending, setPending] = useState<string | undefined>();
  const [month, setMonth] = useState(() => toLocalDate(range.from));
  const [today] = useState(() => formatCalendarDate(new Date(), timeZone));

  // 🏗 Setup
  const mode = resolveMode(pickedMode, view);

  // 💪 Handlers
  const handleCommit = (next: DateRangeValue): void => {
    setPending(undefined);
    onApply(next);
    onClose();
  };
  const handleDayClick = (date: Date): void => {
    const day = toLocalDay(date);

    if (pending === undefined) {
      setPending(day);
      onApply({ from: day, to: day });
    } else {
      handleCommit(
        day < pending ? { from: day, to: pending } : { from: pending, to: day },
      );
    }
  };
  const handleModeChange = (next: DatePickerMode): void => {
    setPickedMode(next);
    setPending(undefined);
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="date-picker-panel"
    >
      <div className="flex w-full max-w-full min-w-0 flex-col items-center gap-2 p-2 md:w-[30rem]">
        <DatePickerModes
          className="flex flex-wrap justify-center gap-1"
          mode={mode}
          onModeChange={handleModeChange}
          view={view}
        />
        {mode === "day" ? (
          <Calendar
            mode="range"
            month={month}
            numberOfMonths={2}
            onDayClick={handleDayClick}
            onMonthChange={setMonth}
            selected={{
              from: toLocalDate(range.from),
              to: toLocalDate(range.to),
            }}
            showOutsideDays={false}
          />
        ) : null}
        {mode === "week" ? (
          <DatePickerWeeks
            className="w-72 p-2"
            onSelect={handleCommit}
            range={range}
            today={today}
          />
        ) : null}
        {isGridMode(mode) ? (
          <DatePickerPeriods
            key={mode}
            className="w-72 p-2"
            mode={mode}
            onSelect={handleCommit}
            range={range}
          />
        ) : null}
      </div>
      <DatePickerFooter
        className="flex flex-wrap items-center justify-between gap-2 border-t p-2"
        hint={getLayoutHint(view, mode)}
        onToday={() => {
          handleCommit(getPeriod(mode, today));
        }}
        range={range}
      />
    </div>
  );
}
