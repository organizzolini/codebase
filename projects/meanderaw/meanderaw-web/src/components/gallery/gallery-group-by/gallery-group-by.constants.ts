// ♟️ Constants

/**
 * The most levels a grouping may nest, as the API allows.
 */
export const MAXIMUM_GROUP_LEVELS = 4;

/**
 * The title of the group surface and the Group button.
 */
export const GROUP_TITLE = "Group";

/**
 * The shape fields a grouping may name, each with what it holds.
 */
export const SHAPE_GROUP_FIELDS = [
  {
    description: "How many rows the meander has",
    key: "rows",
    label: "Rows",
  },
  {
    description: "How many columns the meander has",
    key: "columns",
    label: "Columns",
  },
] as const;
