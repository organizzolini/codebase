/** Select-list columns for a grouping, and its $n placeholder values. */
export interface CompiledEventGrouping {
  parameters: unknown[];
  /**
   * Starts with a comma, to follow a select list, or is empty for no levels.
   */
  sql: string;
}

/** A grouping level: its field, and tags or a depth. */
export interface EventGroupLevel {
  depth?: number | undefined;
  field: string;
  /** The tag whose children the level groups by, in place of the root's own. */
  parent?: string | undefined;
  tags: string[];
}
