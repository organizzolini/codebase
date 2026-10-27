import { getTagColor } from "../lib/calendar/calendar-tag-colors";

import type { CalendarEventTag } from "../lib/events-database/events-database.types";
import type { CSSProperties, ReactNode } from "react";

// 🔖 Type

/**
 * The tags to draw as pills.
 */
export interface EventTagPillsProperties {
  className?: string;
  tags?: readonly CalendarEventTag[];
}

// 🧩 Component

/**
 * Draws each tag as a pill, tinted in the color of its tree so that tags of
 * a kind read alike wherever they are shown. A pill names its tag, and its
 * title gives the tag's path from its root.
 */
export function EventTagPills(
  properties: Readonly<EventTagPillsProperties>,
): ReactNode {
  const { className, tags = [] } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="event-tag-pills"
    >
      <ul
        aria-label="Tags"
        className="flex flex-wrap gap-1"
      >
        {tags.map((tag) => (
          <li
            key={tag.id}
            className="rounded-full border px-1.5 text-[0.65rem] leading-4 whitespace-nowrap"
            data-path={tag.path}
            style={
              {
                background: `color-mix(in srgb, ${getTagColor(tag)} 18%, transparent)`,
                borderColor: `color-mix(in srgb, ${getTagColor(tag)} 55%, transparent)`,
              } satisfies CSSProperties
            }
          >
            {tag.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
