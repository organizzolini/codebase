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
