import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@codebase/presentation";

import { listDayLevelItems } from "./calendar-day-link.utilities";

import type {
  DayLevel,
  DayOpener,
} from "../calendar-month/calendar-month.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A day's heading, what opening it does, and its menu.
 */
export interface CalendarDayLinkProperties {
  children?: ReactNode;
  className?: string;
  /**
   * The day as `YYYY-MM-DD`, which the menu's levels open.
   */
  day: string;
  /**
   * Names where it goes, for a screen reader: "Open the week of Nov 25".
   */
  label: string;
  /**
   * The level the heading is on, marked in its menu.
   */
  level: DayLevel;
  /**
   * What a click does; the heading only offers its menu without it.
   */
  onOpen?: (() => void) | undefined;
  /**
   * Opens a level of the day from the menu; there is no menu without it.
   */
  onOpenDay?: DayOpener | undefined;
}

// 🧩 Component

/**
 * A day's heading: a button opening the view below it, and a menu of the day, week and month on a right click.
 */
export function CalendarDayLink(
  properties: Readonly<CalendarDayLinkProperties>,
): ReactNode {
  const {
    children,
    className = "",
    day,
    label,
    level,
    onOpen,
    onOpenDay,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const classes = `hover:bg-accent cursor-pointer rounded-md no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`;
  const heading =
    onOpen === undefined ? (
      <span
        aria-haspopup="menu"
        aria-label={label}
        className={classes}
        data-testid="calendar-day-link"
        role="button"
        tabIndex={0}
      >
        {children}
      </span>
    ) : (
      <button
        aria-label={label}
        className={classes}
        data-testid="calendar-day-link"
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
        title={label}
        type="button"
      >
        {children}
      </button>
    );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (onOpenDay === undefined) {
    return heading;
  }

  // 🎨 Markup
  return (
    <ContextMenu>
      <ContextMenuTrigger render={<span className="inline-flex" />}>
        {heading}
      </ContextMenuTrigger>
      <ContextMenuContent
        align="start"
        side="bottom"
      >
        {listDayLevelItems(level).map(
          ({ Icon, isCurrent, label: item, level: target }) => (
            <ContextMenuItem
              key={target}
              aria-current={isCurrent ? "true" : undefined}
              disabled={isCurrent}
              onClick={() => {
                onOpenDay(target, day);
              }}
            >
              <Icon aria-hidden="true" />
              {item}
            </ContextMenuItem>
          ),
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
