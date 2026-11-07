import { CLUSTER_ID_PREFIX } from "../../hooks/use-calendar-clusters/calendar-clusters.constants";

import { SPACES, WORD_START } from "./calendar-glyphs.constants";

import type { CalendarEventRecord } from "../events-calendar/events-database.types";
import type { EventLabel } from "./calendar-glyphs.types";

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
  // A summary with no English has no boundary, and so no symbols apart from
  // its name: the slice before a boundary of 0 is empty.
  const symbols = summary
    .slice(0, Math.max(boundary, 0))
    .replaceAll(SPACES, "");
  const words = boundary < 0 ? "" : summary.slice(boundary).trim();
  const name = words === "" ? summary : words;

  return {
    details: ["", name].includes(description) ? undefined : description,
    glyphs: symbols === "" ? summary : symbols,
    name,
  };
}
