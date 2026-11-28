import type { EventLabel } from "../event-glyphs/components/calendar-glyphs/calendar-glyphs.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The symbols a card draws above the name: the event's own, none for a marker of several or a name alone.
 */
export function getCardGlyphs(
  label: undefined | { details?: string; name: string },
  eventLabel: EventLabel,
): string | undefined {
  return label === undefined && eventLabel.glyphs !== eventLabel.name
    ? eventLabel.glyphs
    : undefined;
}
