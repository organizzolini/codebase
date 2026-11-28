import { ChevronDown, ChevronRight } from "lucide-react";

import { TagLead } from "../../../../calendar-events/tag-lead/tag-lead";

import { GROUP_COUNT_CLASS_NAME } from "./calendar-group-chip.constants";

import type { CalendarGroupReference } from "../calendar-groups/calendar-groups.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * What a chip says, and how it is drawn.
 */
export interface CalendarGroupChipContentProperties {
  className?: string;
  count: number;
  dense: boolean;
  expanded: boolean | undefined;
  group: CalendarGroupReference;
  /**
   * Whether the chip toggles, which draws its chevron.
   */
  isToggle: boolean;
}

// 🧩 Component

/**
 * The inside of a group chip: a chevron when it toggles, the group's icon, its name unless dense, and its count.
 */
export function CalendarGroupChipContent(
  properties: Readonly<CalendarGroupChipContentProperties>,
): ReactNode {
  const { className, count, dense, expanded, group, isToggle } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const Chevron = expanded === true ? ChevronDown : ChevronRight;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className ?? "contents"}
      data-testid="calendar-group-chip-content"
    >
      {isToggle && !dense ? (
        <Chevron
          aria-hidden="true"
          className="size-3 shrink-0"
        />
      ) : null}
      {group.key === null ? null : (
        <TagLead
          id={group.key}
          label={group.label}
        />
      )}
      {dense ? null : (
        <span className="truncate @max-[8rem]:hidden">{group.label}</span>
      )}
      <span
        className={GROUP_COUNT_CLASS_NAME}
        data-testid="calendar-group-count"
      >
        {count}
      </span>
    </div>
  );
}
