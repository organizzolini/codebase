import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button, ButtonGroup, ButtonGroupText } from "@codebase/presentation";

import { SURFACE_CLASS_NAMES } from "../../calendar-display/events-calendar/components/calendar-views/calendar-surfaces.constants";
import { CalendarDatePicker } from "../calendar-date-picker/calendar-date-picker";

import type {
  CalendarDatePickerBinding,
  CalendarNavigation,
} from "./calendar-navigation-group.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The view's navigation, and whether the title may shrink.
 */
export interface CalendarNavigationGroupProperties {
  className?: string;
  /**
   * Lets the title shrink and truncate instead of holding its width, as a
   * phone's row needs.
   */
  compact?: boolean | undefined;
  navigation: CalendarNavigation;
  /**
   * Makes the title the button that opens the date picker; plain text when absent.
   */
  picker?: CalendarDatePickerBinding | undefined;
}

// 🧩 Component

/**
 * Renders Today, then previous and next buttons around the period's title; the title holds one width for every view.
 */
export function CalendarNavigationGroup(
  properties: Readonly<CalendarNavigationGroupProperties>,
): ReactNode {
  const { className, compact, navigation, picker } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-navigation-group"
    >
      <ButtonGroup aria-label="Navigate">
        {navigation.isToday === true ? null : (
          <Button
            onClick={navigation.today}
            size="sm"
            variant="outline"
          >
            Today
          </Button>
        )}
        <Button
          aria-label="Previous"
          className="w-8"
          onClick={navigation.prev}
          size="sm"
          variant="outline"
        >
          <ChevronLeft
            aria-hidden="true"
            className="size-5"
          />
        </Button>
        <ButtonGroupText
          aria-level={2}
          className={`h-7 justify-center px-0 ${SURFACE_CLASS_NAMES.navigationTitle} font-semibold tabular-nums ${compact ? "min-w-0 grow truncate text-sm" : "truncate text-base"}`}
          role="heading"
        >
          {picker === undefined ? (
            <span className="px-3">{navigation.title}</span>
          ) : (
            <CalendarDatePicker
              className="contents"
              title={navigation.title}
              triggerClassName="h-full min-w-0 cursor-pointer truncate px-3 hover:bg-muted"
              {...picker}
            />
          )}
        </ButtonGroupText>
        <Button
          aria-label="Next"
          className="w-8"
          onClick={navigation.next}
          size="sm"
          variant="outline"
        >
          <ChevronRight
            aria-hidden="true"
            className="size-5"
          />
        </Button>
      </ButtonGroup>
    </div>
  );
}
