import type { EventGroupLevel } from "../calendar-group-by/event-groups.types";
import type { EventFacet } from "../events-calendar/events-database.types";
import type { AgendaListRow, AgendaRow } from "./calendar-agenda.types";

// ♟️ Constants

export const LATER_ROW: AgendaListRow = { kind: "later" };

export const NO_FACETS: readonly EventFacet[] = [];

export const NO_GROUPING: readonly EventGroupLevel[] = [];

// Headings start below the page's and the toolbar's.
export const HEADING_TAGS = ["h3", "h4", "h5", "h6"] as const;

export const EVENT_COUNT_RULES = new Intl.PluralRules("en-US");

// An event row's chrome beside its text: padding, the time, the dot and the
// gaps between them, and a scrollbar.
export const EVENT_ROW_CHROME_WIDTH = 160;

// What an event row holds above its tags: padding, the name and the duration.
export const EVENT_ROW_BASE_HEIGHT = 52;

// A pill is drawn at about this width per character, plus its border and
// padding, and a gap of 4px lies between pills and between lines of them.
export const PILL_CHARACTER_WIDTH = 5.8;

export const PILL_CHROME_WIDTH = 14;

export const PILL_GAP = 4;

export const PILL_LINE_HEIGHT = 20;

/**
 * How tall each kind of agenda row is drawn, in pixels, so the list can be
 * windowed without measuring a row.
 */
export const AGENDA_ROW_HEIGHTS: Readonly<Record<AgendaRow["kind"], number>> = {
  day: 36,
  event: 56,
  group: 40,
};
