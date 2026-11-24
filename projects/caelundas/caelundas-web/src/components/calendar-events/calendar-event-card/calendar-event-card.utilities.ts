import type { EventLabel } from "../event-glyphs/components/calendar-glyphs/calendar-glyphs.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The symbols a card draws above the name: those of the event, none for a marker standing for several events, and none when the event is drawn by its name alone.
 */
export function getCardGlyphs(
  label: undefined | { details?: string; name: string },
  eventLabel: EventLabel,
): string | undefined {
  return label === undefined && eventLabel.glyphs !== eventLabel.name
    ? eventLabel.glyphs
    : undefined;
}
