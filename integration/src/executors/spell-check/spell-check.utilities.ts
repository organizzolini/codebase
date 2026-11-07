// 🛠️ Utilities

import { FINDING, SPELL_CHECKED_FILES } from "./spell-check.constants";

import type { BuildCspellArguments } from "./spell-check.types";

/** Builds the arguments of one cspell run over the given project roots. */
export function buildCspellArguments(args: BuildCspellArguments): string[] {
  return [
    "--config",
    args.configuration,
    ...args.roots.map((root) => `${root}/${SPELL_CHECKED_FILES}`),
    "--no-progress",
    "--no-summary",
    "--gitignore",
    "--gitignore-root",
    ".",
  ];
}

/** The roots a finding is charged to: every one whose directory holds it. */
export function chargedRoots(
  output: string,
  roots: readonly string[],
): ReadonlySet<string> {
  const charged = new Set<string>();

  for (const match of output.matchAll(FINDING)) {
    const file = (match.groups?.["file"] ?? "").replace(/^\.\//u, "");

    for (const root of roots) {
      if (file.startsWith(`${root}/`)) {
        charged.add(root);
      }
    }
  }

  return charged;
}
