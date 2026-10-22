import { useSyncExternalStore } from "react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  ToggleGroup,
  ToggleGroupItem,
} from "@codebase/presentation";

import {
  isDesktopViewport,
  subscribeToDesktopViewport,
} from "../lib/calendar/calendar-viewport";
import {
  CALENDAR_VIEW_LABELS,
  CALENDAR_VIEWS,
  type CalendarViewName,
  parseCalendarView,
} from "../lib/calendar/calendar-views";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The view shown, where to send another, and whether the row is too narrow
 * for a button per view.
 */
export interface CalendarViewSelectProperties {
  className?: string;
  /**
   * Collapses the buttons into one menu, as a phone's toolbar row needs.
   */
  compact?: boolean | undefined;
  onViewChange: (view: CalendarViewName) => void;
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Renders one pressed button per view on a desktop, or on a narrower row, a
 * tablet's included, a menu button naming the current view that lists every
 * view.
 */
export function CalendarViewSelect(
  properties: Readonly<CalendarViewSelectProperties>,
): ReactNode {
  const { className, compact = false, onViewChange, view } = properties;

  // 🪝 Hooks
  const isDesktop = useSyncExternalStore(
    subscribeToDesktopViewport,
    isDesktopViewport,
  );

  // 🏗 Setup
  // Six buttons need a desktop's width; a tablet's row, like a phone's, lists
  // the views in a menu.
  const asMenu = compact || !isDesktop;

  // 💪 Handlers
  // Pressing the view already shown would release it, leaving no value;
  // that is ignored rather than taken for a change.
  const handleValueChange = (values: readonly unknown[]): void => {
    const next = parseCalendarView(values[0]);

    if (next !== undefined) {
      onViewChange(next);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-view-select"
    >
      {asMenu ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label={`View: ${CALENDAR_VIEW_LABELS[view]}`}
                size="sm"
                variant="outline"
              />
            }
          >
            {CALENDAR_VIEW_LABELS[view]}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              onValueChange={(next: unknown) => {
                handleValueChange([next]);
              }}
              value={view}
            >
              {CALENDAR_VIEWS.map((option) => (
                <DropdownMenuRadioItem
                  key={option}
                  value={option}
                >
                  {CALENDAR_VIEW_LABELS[option]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <ToggleGroup
          aria-label="View"
          onValueChange={handleValueChange}
          size="sm"
          spacing={0}
          value={[view]}
          variant="outline"
        >
          {CALENDAR_VIEWS.map((option) => (
            <ToggleGroupItem
              key={option}
              value={option}
            >
              {CALENDAR_VIEW_LABELS[option]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
    </div>
  );
}
