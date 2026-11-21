import { CalendarClock } from "lucide-react";

import {
  Button,
  ButtonGroup,
  ButtonGroupText,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { CALENDAR_VIEW_LABELS } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { parseCalendarView } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";
import { QueryCascader } from "../../calendar-query/query-cascader/query-cascader";

import { STRIP_CLASS_NAME, TITLE } from "./calendar-views-menu.constants";
import { createViewItems } from "./calendar-views-menu.utilities";

import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The view shown, and its change handler.
 */
export interface CalendarViewsMenuProperties {
  className?: string;
  onViewChange: (view: CalendarViewName) => void;
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Renders the Calendar button, which opens a searchable list of the views, joined to a chip naming the one shown.
 */
export function CalendarViewsMenu(
  properties: Readonly<CalendarViewsMenuProperties>,
): ReactNode {
  const { className, onViewChange, view } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const items = createViewItems();

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-views-menu"
    >
      <ButtonGroup
        aria-label={TITLE}
        className={STRIP_CLASS_NAME}
      >
        <Popover>
          <PopoverTrigger
            render={
              <Button
                size="sm"
                variant="outline"
              >
                <CalendarClock aria-hidden="true" />
                {TITLE}
              </Button>
            }
          />
          <PopoverContent
            align="start"
            aria-label="Calendar views"
            className="w-64 max-w-[90vw] p-0"
          >
            <QueryCascader
              items={items}
              onValueChange={([picked]) => {
                const next = parseCalendarView(picked);

                if (next !== undefined) {
                  onViewChange(next);
                }
              }}
              placeholder="Search views"
              value={[view]}
            />
          </PopoverContent>
        </Popover>
        <ButtonGroupText>{CALENDAR_VIEW_LABELS[view]}</ButtonGroupText>
      </ButtonGroup>
    </div>
  );
}
