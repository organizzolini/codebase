import {
  NOT_PHASE_BOUNDARY_FACTS_SQL,
  NOT_PHASE_BOUNDARY_SQL,
} from "./event-filter-sql.constants";

import type { EventScope } from "../../event-filter.types";

// 🌎 Public Functions

/**
 * The condition keeping the raw events `event` names in scope: `true` when
 * the scope leaves none out.
 */
export function compileEventScope(scope: EventScope, event: string): string {
  return scope.includePhaseBoundaries
    ? "true"
    : NOT_PHASE_BOUNDARY_SQL.replaceAll("{event}", () => event);
}

/**
 * The condition, with its leading `and`, keeping the `event` grain rows `alias` names in scope; empty when none leave.
 */
export function compileFactsScope(scope: EventScope, alias: string): string {
  return scope.includePhaseBoundaries
    ? ""
    : ` and ${NOT_PHASE_BOUNDARY_FACTS_SQL.replaceAll("{alias}", () => alias)}`;
}
