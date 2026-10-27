import type { EventGroupLevel } from "../types/event-groups.types";
import type { EventFacet } from "../types/events-database.types";
import type { AgendaListRow } from "./calendar-agenda.types";

export const LATER_ROW: AgendaListRow = { kind: "later" };

export const NO_FACETS: readonly EventFacet[] = [];

export const NO_GROUPING: readonly EventGroupLevel[] = [];

// Headings start below the page's and the toolbar's.
export const HEADING_TAGS = ["h3", "h4", "h5", "h6"] as const;

export const EVENT_COUNT_RULES = new Intl.PluralRules("en-US");
