import { CLUSTER_ID_PREFIX } from "./calendar-clusters";

import type { CalendarEventRecord } from "../events-database/events-database.types";

// 🔖 Type

/**
 * What an event is called, in the two forms the calendar uses: the glyphs
 * its chip shows, and the English name and description its tooltip says.
 */
export interface EventLabel {
  /**
   * What the database says of the event beyond its name, or nothing when it
   * says nothing or only repeats the name.
   */
  details: string | undefined;
  /**
   * The symbols and emoji of the event's name, which is all a chip shows;
   * the whole name for an event with no symbols.
   */
  glyphs: string;
  /**
   * The event's name in English, without its symbols.
   */
  name: string;
}

/**
 * The start of a word of English, after the start of the summary or a space:
 * two letters or more, so that the one-letter symbols of some aspects, such as
 * the N of a novile, are not read as words.
 */
const WORD_START = /(?<=^|\s)\p{L}{2,}/u;

/**
 * The mark of an aspect that is exact, which is no mark worth drawing: an
 * instant says as much. It stays in the event's own name.
 */
const PERFECTIVE = /\u{1F3AF}\s*/gu;

// 🧩 Functions

/**
 * Splits an event's summary, which an ingested event writes as its symbols
 * followed by its name in English, into the two. The description, which
 * repeats the name, says where the name starts; without one the name starts
 * at the first word of English. A stand-in for a cluster, and an event with no
 * symbols, are all name.
 */
export function getEventLabel(event: CalendarEventRecord): EventLabel {
  const { description, id, summary } = event;

  if (id.startsWith(CLUSTER_ID_PREFIX)) {
    return { details: undefined, glyphs: summary, name: summary };
  }

  const boundary =
    description !== "" && summary.endsWith(description)
      ? summary.length - description.length
      : summary.search(WORD_START);
  const symbols =
    boundary < 0
      ? ""
      : summary.slice(0, boundary).replaceAll(PERFECTIVE, "").trim();
  const words = boundary < 0 ? "" : summary.slice(boundary).trim();
  const name = words === "" ? summary : words;

  return {
    details:
      description === "" || description === name ? undefined : description,
    glyphs: symbols === "" ? summary : symbols,
    name,
  };
}
