// 🏷️ Types

/** A calendar field's rollup column and the key SQL it makes. */
export interface RollupCalendarKey {
  column: string;
  key: string;
  /** The column's SQL over a row `{r}`, which carries its day. */
  source: string;
}

/** What a rollup statement groups by and reads. */
export interface RollupTarget {
  /** The facts of each day, or of each day and tag node, as rows. */
  cells: string;
  columns: string;
  crossingExtra: string;
  crossingJoin: string;
  /** The rollup column the groups are of, or none for the whole set. */
  group: null | string;
  join: string;
  rollupExtra: string;
  /** The tag whose children are the groups, when a tag level. */
  root: null | string;
  /** The statement of the events that are in no group, or none. */
  untagged: string;
  /** Those events as rows of the groups' shape, or none. */
  untaggedRows: string;
}
