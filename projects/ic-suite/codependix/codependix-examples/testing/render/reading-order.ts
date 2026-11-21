// ♟️ Constants

/** Folder grouping each example under `examples/`, in reading order. */
export const EXAMPLE_GROUPS = {
  boundaries: [
    "boundary-rules",
    "boundary-cycles",
    "boundary-forbidden-edges",
    "boundary-dependency-notes",
    "boundary-boot-failures",
  ],
  diagnostics: ["refusals", "path-queries", "workspace-drift"],
  exports: [
    "configuration-resolution",
    "export-targets",
    "markdown-modes",
    "auto-created-sections",
    "check-and-write",
    "json-exports",
  ],
  graphs: [
    "graph-levels",
    "neighborhood-scope",
    "ambient-modules",
    "preview-mode",
    "container-rooting",
    "typescript-resolution",
    "python-scanner",
  ],
} as const;

/** Every example in reading order, for `## Next` links; imports nothing. */
export const EXAMPLE_ORDER = [
  ...EXAMPLE_GROUPS.graphs,
  ...EXAMPLE_GROUPS.exports,
  ...EXAMPLE_GROUPS.boundaries,
  ...EXAMPLE_GROUPS.diagnostics,
] as const;

/** Title emoji per example directory, so no two share one. */
export const EXAMPLE_EMOJI: Record<string, string> = {
  "ambient-modules": "🌍",
  "auto-created-sections": "🪄",
  "boundary-boot-failures": "💥",
  "boundary-cycles": "🔄",
  "boundary-dependency-notes": "🗒️",
  "boundary-forbidden-edges": "⛔",
  "boundary-rules": "🚧",
  "check-and-write": "🔀",
  "configuration-resolution": "⚙️",
  "container-rooting": "🌱",
  "export-targets": "🎯",
  "graph-levels": "🗺️",
  "json-exports": "📦",
  "markdown-modes": "📝",
  "neighborhood-scope": "🏘️",
  "path-queries": "🛤️",
  "preview-mode": "👁️",
  "python-scanner": "🐍",
  refusals: "🚫",
  "typescript-resolution": "🧭",
  "workspace-drift": "🌊",
};

// 🔗 Chaining

/** An example's directory relative to `examples/`. */
export function exampleDirectory(id: string): string {
  const group = groupOf(id);

  return group === undefined ? id : `${group}/${id}`;
}

/** The group folder holding an example, if the reading order names it. */
export function groupOf(id: string): string | undefined {
  return Object.entries(EXAMPLE_GROUPS).find(([, members]) =>
    (members as readonly string[]).includes(id),
  )?.[0];
}

/** The example a guide's `## Next` section points at, if there is one. */
export function nextExample(id: string): string | undefined {
  const order: readonly string[] = EXAMPLE_ORDER;
  const position = order.indexOf(id);

  if (position === -1) return undefined;

  return order[position + 1];
}
