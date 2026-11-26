// ♟️ Constants

/** The tags a false flag keeps out of filters or groupings. */
export const BLOCKED_TAGS_SQL = `
  select id, is_filterable, is_groupable
  from tags
  where not is_filterable or not is_groupable
`;
