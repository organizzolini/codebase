import { Button, ButtonGroup, ButtonGroupText } from "@codebase/presentation";

import { SURFACE_CLASS_NAMES } from "../events-calendar/calendar-surfaces.constants";

import type { CalendarNavigation } from "./calendar-navigation-group.types";
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
}

// 🧩 Component

/**
 * Renders Today, then previous and next buttons around the period's title; the title holds one width for every view.
 */
export function CalendarNavigationGroup(
  properties: Readonly<CalendarNavigationGroupProperties>,
): ReactNode {
  const { className, compact, navigation } = properties;

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
        <Button
          disabled={navigation.isToday === true}
          onClick={navigation.today}
          size="sm"
          variant="outline"
        >
          Today
        </Button>
        <Button
          aria-label="Previous"
          className="w-9 text-lg leading-none"
          onClick={navigation.prev}
          size="sm"
          variant="outline"
        >
          ‹
        </Button>
        <ButtonGroupText
          aria-level={2}
          className={`h-7 justify-center ${SURFACE_CLASS_NAMES.navigationTitle} font-semibold ${compact ? "min-w-0 grow truncate text-sm" : "w-60 truncate text-base"}`}
          role="heading"
        >
          {navigation.title}
        </ButtonGroupText>
        <Button
          aria-label="Next"
          className="w-9 text-lg leading-none"
          onClick={navigation.next}
          size="sm"
          variant="outline"
        >
          ›
        </Button>
      </ButtonGroup>
    </div>
  );
}
