import { TAG_FIELD_PREFIX } from "../../../calendar-filters/components/event-filter-model/event-filters.constants";

import { PATH_SEPARATOR } from "./event-group-tree.constants";

import type { EventFacet } from "../../../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { TagRanks } from "./event-group-tree.types";

/**
 * How tags rank when sorting by a tag: each tag's tree-order place, and the path prefix beneath each field or tag.
 */
export function createTagRanks(facets: readonly EventFacet[]): TagRanks {
  const prefixes = new Map<string, string>();
  const ranks = new Map<string, number>();
  let rank = 0;

  // Loops rather than mapping callbacks keep the call stacks shallow.
  for (const facet of facets) {
    prefixes.set(
      `${TAG_FIELD_PREFIX}${facet.id}`,
      `${facet.name}${PATH_SEPARATOR}`,
    );

    for (const value of facet.values) {
      ranks.set(value.id, rank);
      prefixes.set(
        value.id,
        `${facet.name}${PATH_SEPARATOR}${value.path}${PATH_SEPARATOR}`,
      );
      rank += 1;
    }
  }

  return { prefixes, ranks };
}
