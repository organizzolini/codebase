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
 * One validated level of a grouping: the field it groups by and, for a tag
 * root, the tags it makes a group of, or else the depth it reads.
 */
export interface EventGroupLevel {
  depth?: number | undefined;
  field: string;
  tags: string[];
}
