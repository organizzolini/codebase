import { useState } from "react";

import { CalendarGroupChip } from "../../calendar-group-chip";
import { CalendarGroupList } from "../calendar-group-list/calendar-group-list";

import { toggleOpen } from "./calendar-open-groups.utilities";

import type { CalendarEventGroup } from "../../../calendar-groups/calendar-groups.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A day's groups, which open in place to list their events.
 */
export interface CalendarOpenGroupsProperties {
  /**
   * Opens every group and leaves none to toggle, so every event is listed.
   */
  allOpen?: boolean;
  className?: string;
  /**
   * The day as `YYYY-MM-DD` in the data's zone.
   */
  day: string;
  groups: readonly CalendarEventGroup[];
  /**
   * Whether each listed event starts with its time; it does when absent.
   */
  showTime?: boolean;
  timeZone: string;
}

// 🧩 Component

/**
 * Draws a day's groups as chips, each a button that opens its events as a list beneath it, in place.
 */
export function CalendarOpenGroups(
  properties: Readonly<CalendarOpenGroupsProperties>,
): ReactNode {
  const {
    allOpen = false,
    className,
    day,
    groups,
    showTime = true,
    timeZone,
  } = properties;

  // 🪝 Hooks
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={`@container flex min-w-0 flex-wrap gap-1 ${className ?? ""}`}
      data-testid="calendar-open-groups"
    >
      {groups.map((group) => {
        const isOpen = allOpen || open.has(group.id);

        return (
          <div
            key={group.id}
            className={isOpen ? "w-full" : "max-w-full min-w-0"}
          >
            <CalendarGroupChip
              color={group.color}
              count={group.events.length}
              expanded={isOpen}
              group={group}
              onToggle={
                allOpen
                  ? undefined
                  : () => {
                      setOpen((previous) => toggleOpen(previous, group.id));
                    }
              }
            />
            {isOpen ? (
              <CalendarGroupList
                cap={allOpen ? Number.POSITIVE_INFINITY : undefined}
                day={day}
                events={group.events}
                showTime={showTime}
                timeZone={timeZone}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
