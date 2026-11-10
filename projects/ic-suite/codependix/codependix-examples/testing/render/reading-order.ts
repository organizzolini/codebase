// ♟️ Constants

/**
 * Every example in reading order, for each `## Next` link. Imports nothing, to
 * avoid an import cycle.
 */
export const EXAMPLE_ORDER = [
  "graph-levels",
  "neighborhood-scope",
  "ambient-modules",
  "preview-mode",
  "container-rooting",
  "typescript-resolution",
  "python-scanner",
  "configuration-resolution",
  "export-targets",
  "markdown-modes",
  "auto-created-sections",
  "check-and-write",
  "boundary-rules",
  "boundary-cycles",
  "boundary-forbidden-edges",
  "boundary-dependency-notes",
  "boundary-boot-failures",
  "refusals",
  "path-queries",
  "json-exports",
  "workspace-drift",
] as const;

/**
 * Each example's title emoji, keyed by directory name, kept beside the reading
 * order so no two examples can share one.
 */
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

/** The example a guide's `## Next` section points at, if there is one. */
export function nextExample(id: string): string | undefined {
  const order: readonly string[] = EXAMPLE_ORDER;
  const position = order.indexOf(id);

  if (position === -1) return undefined;

  return order[position + 1];
}
