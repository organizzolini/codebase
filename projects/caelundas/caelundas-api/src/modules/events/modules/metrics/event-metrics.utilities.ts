import { FACTS_GRAINS } from "./event-metrics.constants";

import type { FactsGrain } from "./event-metrics.types";

// 🌎 Public Functions

/**
 * The condition that pins the facts rows `alias` names to one grain, so grains
 * never mix and the planner leads with the `filter` index.
 */
export function pinGrain(alias: string, grain: FactsGrain): string {
  return `${alias}."filter" = '${FACTS_GRAINS[grain]}'`;
}
