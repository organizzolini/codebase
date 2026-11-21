// ♟️ Constants

/**
 * The most levels a grouping may nest, as the API allows.
 */
export const MAXIMUM_GROUP_LEVELS = 4;

/**
 * The shape fields a grouping may name, each with a label.
 */
export const SHAPE_GROUP_FIELDS = [
  { key: "rowsColumns", label: "Rows × columns" },
  { key: "lattice", label: "Lattice" },
  { key: "isHardcoded", label: "Hardcoded" },
] as const;

/**
 * The API's cap on filter nesting, the root being level 1.
 */
export const API_MAXIMUM_DEPTH = 6;

/**
 * The API's cap on rules and groups, root excepted.
 */
export const API_MAXIMUM_ENTRIES = 128;
