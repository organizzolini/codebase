import { toGlyphParts } from "../lib/calendar/calendar-icons";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The symbols to draw as icons.
 */
export interface EventGlyphsProperties {
  className?: string;
  glyphs: string;
}

// 🧩 Component

/**
 * Draws an event's symbols as icons, one for each symbol and in its order,
 * so that they read as the emoji they stand for do. A symbol with no icon is
 * drawn as it is written. The icons take the text's color.
 */
export function EventGlyphs(
  properties: Readonly<EventGlyphsProperties>,
): ReactNode {
  const { className = "inline", glyphs } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const parts = toGlyphParts(glyphs);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="event-glyphs"
    >
      {parts.map((part) =>
        part.kind === "text" ? (
          <span key={part.id}>{part.text}</span>
        ) : (
          <span
            key={part.id}
            aria-hidden="true"
            className="inline-block size-[1.1em] shrink-0 bg-current align-[-0.2em]"
            data-icon={part.file}
            style={{
              mask: `url("${part.url}") center / contain no-repeat`,
              WebkitMask: `url("${part.url}") center / contain no-repeat`,
            }}
          />
        ),
      )}
    </div>
  );
}
