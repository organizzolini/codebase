import type { MeanderSortInput } from "../../graphql/generated/operations";
import type { SortDirection } from "./use-gallery-search.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Words a link's sort as the API's sort argument, or none to leave the API's
 * own order.
 */
export function toSortInput(
  sort: string | undefined,
  direction: SortDirection,
): MeanderSortInput | undefined {
  return sort === undefined
    ? undefined
    : { direction: direction === "desc" ? "DESC" : "ASC", field: sort };
}
