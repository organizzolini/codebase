// ♟️ Constants

/** Stands in for a column a limit left empty, so the cell is never blank. */
export const ABSENT_LABEL = "—";

/** Heading the whole listing is written under. */
export const CONFIGURATION_HEADING = "# 🔧 Codometer Configuration";

/** Column headers of the limits table, in the order they are rendered. */
export const LIMIT_TABLE_COLUMNS = [
  "Directory",
  "Metric",
  "Label",
  "Severity",
  "Value",
  "Declared in",
] as const;

/**
 * Metric suffix marking a limit whose value is bytes.
 *
 * Only the `.size` metric path says whether it counts bytes.
 */
export const SIZE_METRIC_SUFFIX = ".size";
