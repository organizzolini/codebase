import { TagLead } from "../../../../calendar-events/tag-lead/tag-lead";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The name of a timeline row.
 */
export interface TimelineRowLabelProperties {
  className?: string;
  title: string;
}

// 🧩 Component

/**
 * Renders a timeline row's name, led by its symbol; a lane with no name stays blank.
 */
export function TimelineRowLabel(
  properties: Readonly<TimelineRowLabelProperties>,
): ReactNode {
  const { className = "flex min-w-0 items-center gap-1", title } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (title === "") {
    return <span className="truncate" />;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="timeline-row-label"
    >
      <TagLead label={title} />
      <span className="truncate">{title}</span>
    </div>
  );
}
