import { TagPillLabel } from "../tag-pill-label/tag-pill-label";

import { getTagColor } from "./calendar-tag-colors.utilities";

import type { CalendarEventTag } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
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
 * Draws each tag as a pill tinted in its tree's color, with its path from the root as the title.
 */
export function EventTagPills(
  properties: Readonly<EventTagPillsProperties>,
): ReactNode {
  const { className, tags = [] } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  // A tag under two parents arrives once a path but is one pill.
  const pills: CalendarEventTag[] = [];
  const drawn = new Set<string>();

  for (const tag of tags) {
    if (!drawn.has(tag.id)) {
      drawn.add(tag.id);
      pills.push(tag);
    }
  }

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
        {pills.map((tag) => (
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
            <TagPillLabel
              id={tag.id}
              label={tag.name}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
