// 🏷️ Types

/**
 * A node's place in the tag tree: the names from its root down to it, so
 * `["Type", "Aspect", "Major"]` names the `Major` node under `Aspect` under
 * the `Type` root. An event carrying a path is linked to its last node, and
 * carries the ones above it through the closure table.
 */
export type TagPath = readonly [string, ...string[]];
