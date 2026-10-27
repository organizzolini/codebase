import { CLUSTER_ID_PREFIX } from "../constants/calendar-clusters.constants";
import { SPACES, WORD_START } from "../constants/calendar-glyphs.constants";

import type { EventLabel } from "../types/calendar-glyphs.types";
import type { CalendarEventRecord } from "../types/events-database.types";

// 🌎 Public Functions

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
    boundary < 0 ? "" : summary.slice(0, boundary).replaceAll(SPACES, "");
  const words = boundary < 0 ? "" : summary.slice(boundary).trim();
  const name = words === "" ? summary : words;

  return {
    details:
      description === "" || description === name ? undefined : description,
    glyphs: symbols === "" ? summary : symbols,
    name,
  };
}
