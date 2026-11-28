import { TagLead } from "../../../../calendar-events/tag-lead/tag-lead";

import { createRowCaret, getRowPill } from "./timeline-row-label.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * A timeline row's name, with its group's tag, icon, and color.
 */
export interface TimelineRowLabelProperties {
  className?: string;
  /**
   * Whether the group is closed; read only when it has a toggle.
   */
  collapsed?: boolean | undefined;
  /**
   * The group's color, as the table's group pills have it; none when uncolored.
   */
  color?: string | undefined;
  /**
   * Whether the group holds the events with no value, which draws muted.
   */
  fallback?: boolean | undefined;
  /**
   * A lucide slug for when the tag has no icon of its own, such as a derived field's.
   */
  icon?: string | undefined;
  /**
   * Toggles the group; a row with it draws as a button led by a caret.
   */
  onToggle?: (() => void) | undefined;
  /**
   * The group's tag id, which finds its icon.
   */
  tagId?: string | undefined;
  title: string;
}

// 🧩 Component

/**
 * Renders a timeline row's name, led by its own symbol and tinted with its group's color; a lane with no name stays blank.
 */
export function TimelineRowLabel(
  properties: Readonly<TimelineRowLabelProperties>,
): ReactNode {
  const {
    className = "flex min-w-0 items-center gap-1",
    collapsed = false,
    color,
    fallback = false,
    icon,
    onToggle,
    tagId,
    title,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const { className: pillClassName, style: tint } = getRowPill(fallback, color);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (title === "") {
    return <span className="truncate" />;
  }

  // 🎨 Markup
  const lead = (
    <>
      {onToggle === undefined ? null : createRowCaret(collapsed)}
      <TagLead
        className="mr-1 inline-flex shrink-0 items-center align-middle leading-none"
        icon={icon}
        id={tagId}
        label={title}
      />
      {title}
    </>
  );
  return (
    <div
      className={className}
      data-testid="timeline-row-label"
    >
      {onToggle === undefined ? (
        <span
          className={pillClassName}
          style={tint}
        >
          {lead}
        </span>
      ) : (
        <button
          aria-expanded={!collapsed}
          aria-label={title}
          className={`${pillClassName} cursor-pointer`}
          onClick={onToggle}
          style={tint}
          type="button"
        >
          {lead}
        </button>
      )}
    </div>
  );
}
