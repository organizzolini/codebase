import { use, useState } from "react";

import { CalendarGroupSortContext } from "../../../calendar-groups/calendar-groups.constants";
import { CalendarGroupList } from "../calendar-group-list/calendar-group-list";

import { CalendarGroupCard } from "./calendar-group-card";
import { getSubGroups, toggleOpen } from "./calendar-open-groups.utilities";

import type { EventGrouping } from "../../../../../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { CalendarEventGroup } from "../../../calendar-groups/calendar-groups.types";
import type { SubGroups } from "./calendar-open-groups.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A day's groups, which open in place as cards holding their events.
 */
export interface CalendarOpenGroupsProperties {
  /**
   * Opens every group to start with, each still closing from its header.
   */
  allOpen?: boolean;
  className?: string;
  /**
   * The day as `YYYY-MM-DD` in the data's zone.
   */
  day: string;
  groupColors?: ReadonlyMap<string, string> | undefined;
  /**
   * The grouping, whose levels past this one nest as cards inside the open group.
   */
  grouping?: EventGrouping | undefined;
  groups: readonly CalendarEventGroup[];
  /**
   * The grouping level these groups are of; the first when absent.
   */
  level?: number;
  /**
   * Whether each listed event starts with its time; it does when absent.
   */
  showTime?: boolean;
  timeZone: string;
}

// 🧩 Component

/**
 * Draws a day's groups as chips; an open one is a tinted card, its header the chip, its events or subgroups nested beneath.
 */
export function CalendarOpenGroups(
  properties: Readonly<CalendarOpenGroupsProperties>,
): ReactNode {
  const {
    allOpen = false,
    className,
    day,
    groupColors,
    grouping,
    groups,
    level = 0,
    showTime = true,
    timeZone,
  } = properties;

  // 🪝 Hooks
  const sort = use(CalendarGroupSortContext);
  const [toggled, setToggled] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );

  // 🏗 Setup
  // A loop rather than a mapping callback keeps the call stack shallow.
  const cards: {
    group: CalendarEventGroup;
    isOpen: boolean;
    nested: SubGroups;
  }[] = [];

  for (const group of groups) {
    const isOpen = allOpen !== toggled.has(group.id);

    cards.push({
      group,
      isOpen,
      nested: isOpen
        ? getSubGroups(group, { colors: groupColors, grouping, level, sort })
        : { groups: [], level },
    });
  }

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={`@container flex min-w-0 flex-wrap gap-1 ${className ?? ""}`}
      data-testid="calendar-open-groups"
    >
      {cards.map(({ group, isOpen, nested }) => (
        <CalendarGroupCard
          key={group.id}
          group={group}
          isOpen={isOpen}
          onToggle={() => {
            setToggled((previous) => toggleOpen(previous, group.id));
          }}
        >
          {nested.groups.length > 0 ? (
            <CalendarOpenGroups
              allOpen={allOpen}
              day={day}
              groupColors={groupColors}
              grouping={grouping}
              groups={nested.groups}
              level={nested.level}
              showTime={showTime}
              timeZone={timeZone}
            />
          ) : (
            <CalendarGroupList
              cap={allOpen ? Number.POSITIVE_INFINITY : undefined}
              className="mt-0"
              day={day}
              events={group.events}
              showTime={showTime}
              timeZone={timeZone}
            />
          )}
        </CalendarGroupCard>
      ))}
    </div>
  );
}
