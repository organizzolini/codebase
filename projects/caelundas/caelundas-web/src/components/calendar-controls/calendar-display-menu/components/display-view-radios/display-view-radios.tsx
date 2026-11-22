import { RadioGroup, RadioGroupItem } from "@codebase/presentation";

import {
  CALENDAR_VIEW_LABELS,
  CALENDAR_VIEWS,
} from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { parseCalendarView } from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";

import { VIEW_ICONS } from "./display-view-radios.constants";

import type { CalendarViewName } from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The view shown, and what to do when another is picked.
 */
export interface DisplayViewRadiosProperties {
  className?: string;
  onViewChange: (view: CalendarViewName) => void;
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Renders the calendar views as a vertical radio group, the one shown picked.
 */
export function DisplayViewRadios(
  properties: Readonly<DisplayViewRadiosProperties>,
): ReactNode {
  const { className, onViewChange, view } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers
  const handleValueChange = (next: unknown): void => {
    const chosen = parseCalendarView(String(next));

    if (chosen !== undefined) {
      onViewChange(chosen);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <RadioGroup
      aria-label="Calendar"
      className={`gap-0 p-1 ${className ?? ""}`}
      data-testid="display-view-radios"
      onValueChange={handleValueChange}
      value={view}
    >
      {CALENDAR_VIEWS.map((name) => {
        const Icon = VIEW_ICONS[name];

        return (
          <label
            key={name}
            className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
          >
            <RadioGroupItem value={name} />
            <Icon
              aria-hidden="true"
              className="size-4 shrink-0"
            />
            {CALENDAR_VIEW_LABELS[name]}
          </label>
        );
      })}
    </RadioGroup>
  );
}
