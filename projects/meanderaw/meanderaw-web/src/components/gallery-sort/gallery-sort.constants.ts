// ♟️ Constants

/**
 * The shape fields a sort may name, each with a label.
 */
export const SHAPE_SORT_FIELDS = [
  { key: "rows", label: "Rows" },
  { key: "columns", label: "Columns" },
  { key: "lattice", label: "Lattice" },
  { key: "repeats", label: "Repeats" },
  { key: "isHardcoded", label: "Hardcoded" },
  { key: "code", label: "Code" },
] as const;

/**
 * The control's label for the API's own order.
 */
export const DEFAULT_ORDER_LABEL = "Default order";
