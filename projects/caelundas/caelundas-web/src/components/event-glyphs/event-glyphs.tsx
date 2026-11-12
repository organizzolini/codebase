import { toGlyphParts } from "./calendar-icons.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The symbols to draw as icons.
 */
export interface EventGlyphsProperties {
  className?: string;
  glyphs: string;
  /**
   * The event's name, which tells apart the events whose one symbol is shared.
   */
  name?: string;
}

// 🧩 Component

/**
 * Draws an event's symbols as icons, one per symbol in order; a symbol with no icon is drawn as written.
 */
export function EventGlyphs(
  properties: Readonly<EventGlyphsProperties>,
): ReactNode {
  const { className = "inline", glyphs, name } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const parts = toGlyphParts(glyphs, name);

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
