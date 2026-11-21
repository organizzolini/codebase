import { ToggleGroup, ToggleGroupItem } from "@codebase/presentation";

import {
  CALENDAR_VIEW_LABELS,
  CALENDAR_VIEWS,
} from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { parseCalendarView } from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";

import { VIEW_ICONS } from "./display-view-toggle.constants";

import type { CalendarViewName } from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The view shown, and what to do when another is pressed.
 */
export interface DisplayViewToggleProperties {
  className?: string;
  onViewChange: (view: CalendarViewName) => void;
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Renders the calendar views as a vertical group of toggle buttons, the one shown pressed.
 */
export function DisplayViewToggle(
  properties: Readonly<DisplayViewToggleProperties>,
): ReactNode {
  const { className, onViewChange, view } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers
  const handleValueChange = (next: readonly string[]): void => {
    const chosen = parseCalendarView(next[0] ?? "");

    if (chosen !== undefined) {
      onViewChange(chosen);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <ToggleGroup
      aria-label="Calendar"
      className={className}
      data-testid="display-view-toggle"
      onValueChange={handleValueChange}
      orientation="vertical"
      size="sm"
      spacing={1}
      value={[view]}
      variant="outline"
    >
      {CALENDAR_VIEWS.map((name) => {
        const Icon = VIEW_ICONS[name];

        return (
          <ToggleGroupItem
            key={name}
            className="justify-start"
            value={name}
          >
            <Icon aria-hidden="true" />
            {CALENDAR_VIEW_LABELS[name]}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
