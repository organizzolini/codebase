import { Button, ButtonGroup, ButtonGroupText } from "@codebase/presentation";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * How the toolbar moves the view it sits over, and the title of the period
 * shown: the event calendar's or the timeline's.
 */
export interface CalendarNavigation {
  /**
   * Whether the days the view shows include today, when the Today button
   * has nowhere to go and is switched off.
   */
  isToday?: boolean;
  next: () => void;
  prev: () => void;
  title: string;
  today: () => void;
}

/**
 * How to move the view, and whether the row is too narrow for a title of a
 * fixed width.
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
 * Renders Today, then the previous and next buttons around the title of the
 * period shown. Today is switched off while the period includes today. The title holds one width
 * for every view, however long the period's name runs, so nothing beside it
 * moves when the view changes.
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
          className={`h-7 justify-center bg-background font-semibold ${compact ? "min-w-0 grow truncate text-sm" : "w-60 truncate text-base"}`}
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
