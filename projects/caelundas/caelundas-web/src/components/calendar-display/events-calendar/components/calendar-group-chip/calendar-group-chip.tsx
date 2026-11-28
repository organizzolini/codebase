import { NAME_TINT_PERCENT } from "../../../calendar-table/components/table-name-cell/table-name-cell.constants";
import { getNameTint } from "../../../calendar-table/components/table-name-cell/table-name-cell.utilities";

import { CalendarGroupChipContent } from "./calendar-group-chip-content";
import {
  GROUP_CHIP_BARE_CLASS_NAME,
  GROUP_CHIP_CLASS_NAME,
} from "./calendar-group-chip.constants";

import type { CalendarGroupReference } from "../calendar-groups/calendar-groups.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A group, how many events it holds, and whether it is open.
 */
export interface CalendarGroupChipProperties {
  /**
   * Draws the chip bare, for the box of an event that already carries its color and border.
   */
  bare?: boolean;
  className?: string;
  color?: string | undefined;
  count: number;
  /**
   * Draws only the icon and the count, for a row too slim for the name.
   */
  dense?: boolean;
  /**
   * Whether the group's events are listed; the chip is no button without a handler.
   */
  expanded?: boolean | undefined;
  group: CalendarGroupReference;
  onToggle?: (() => void) | undefined;
}

// 🧩 Component

/**
 * Draws a group as a pill of its icon, name and count, as the table does; a button when given a handler.
 */
export function CalendarGroupChip(
  properties: Readonly<CalendarGroupChipProperties>,
): ReactNode {
  const {
    bare = false,
    className = "",
    color,
    count,
    dense = false,
    expanded,
    group,
    onToggle,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const classes = `${bare ? GROUP_CHIP_BARE_CLASS_NAME : GROUP_CHIP_CLASS_NAME} ${className}`;
  const style = bare
    ? undefined
    : getNameTint(color ?? null, NAME_TINT_PERCENT);
  const title = `${group.label}: ${String(count)}`;
  const content = (
    <CalendarGroupChipContent
      count={count}
      dense={dense}
      expanded={expanded}
      group={group}
      isToggle={onToggle !== undefined}
    />
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (onToggle === undefined) {
    return (
      <div
        className={classes}
        data-testid="calendar-group-chip"
        style={style}
        title={title}
      >
        {content}
      </div>
    );
  }

  // 🎨 Markup
  return (
    <button
      aria-expanded={expanded}
      aria-label={`${group.label}, ${String(count)} events`}
      className={`${classes} cursor-pointer hover:brightness-125`}
      data-testid="calendar-group-chip"
      onClick={onToggle}
      style={style}
      title={title}
      type="button"
    >
      {content}
    </button>
  );
}
