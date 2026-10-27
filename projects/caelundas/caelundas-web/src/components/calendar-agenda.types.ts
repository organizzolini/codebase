import type { AgendaRow } from "../types/calendar-agenda.types";

/**
 * A row the agenda draws: a day, an event, or the button that lists more.
 */
export type AgendaListRow = AgendaRow | { kind: "later" };
