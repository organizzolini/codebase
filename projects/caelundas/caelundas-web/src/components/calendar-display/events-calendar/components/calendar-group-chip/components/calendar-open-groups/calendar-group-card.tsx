import { NAME_TINT_PERCENT } from "../../../../../calendar-table/components/table-name-cell/table-name-cell.constants";
import { getNameTint } from "../../../../../calendar-table/components/table-name-cell/table-name-cell.utilities";
import { CalendarGroupChip } from "../../calendar-group-chip";

import type { CalendarEventGroup } from "../../../calendar-groups/calendar-groups.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * One group: a pill when closed, a tinted card when open.
 */
export interface CalendarGroupCardProperties {
  children?: ReactNode;
  group: CalendarEventGroup;
  isOpen: boolean;
  onToggle: () => void;
}

// 🧩 Component

/**
 * Draws a group as its chip; open, the chip is the header of a card and its events or subgroups nest beneath.
 */
export function CalendarGroupCard(
  properties: Readonly<CalendarGroupCardProperties>,
): ReactNode {
  const { children, group, isOpen, onToggle } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={
        isOpen
          ? "flex w-full min-w-0 flex-col gap-1 rounded-md border p-1"
          : "max-w-full min-w-0"
      }
      data-open={isOpen || undefined}
      data-testid="calendar-group-card"
      style={
        isOpen ? getNameTint(group.color ?? null, NAME_TINT_PERCENT) : undefined
      }
    >
      <CalendarGroupChip
        bare={isOpen}
        className={isOpen ? "h-6" : ""}
        color={group.color}
        count={group.events.length}
        expanded={isOpen}
        group={group}
        onToggle={onToggle}
      />
      {isOpen ? children : null}
    </div>
  );
}
