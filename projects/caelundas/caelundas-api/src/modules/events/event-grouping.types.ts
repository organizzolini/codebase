/**
 * A grouping compiled to the select-list columns that read each level's
 * group keys, and the values their `$n` placeholders stand for.
 */
export interface CompiledEventGrouping {
  parameters: unknown[];
  /**
   * Starts with a comma, to follow a select list, or is empty for no levels.
   */
  sql: string;
}

/**
 * A validated grouping level: its field, and for a tag root either the tags
 * it groups by or a depth.
 */
export interface EventGroupLevel {
  depth?: number | undefined;
  field: string;
  tags: string[];
}
