// ♟️ Constants

import { InputError } from "@codependix/configuration";

import type { ResolvedCodependixSelection } from "@codependix/configuration";

/** Unmatched `--projects` or `--tags` selection; refused, not run. */
export const emptySelectionError = (
  selection: ResolvedCodependixSelection,
): InputError => {
  const patterns = [
    ...(selection.projects.length > 0
      ? [`--projects ${selection.projects.join(",")}`]
      : []),
    ...(selection.tags.length > 0
      ? [`--tags ${selection.tags.join(",")}`]
      : []),
  ];

  return new InputError(
    `${patterns.join(" and ")} matched no project, so there is nothing to judge or draw.`,
  );
};
