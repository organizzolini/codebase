// ♟️ Constants

/** Placeholder for an empty limit cell, never leaving it blank. */
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

/** Metric suffix for byte-valued limits; only `.size` paths say so. */
export const SIZE_METRIC_SUFFIX = ".size";
