// ♟️ Constants

/**
 * Locks the `tags` table until the transaction ends, in a mode that conflicts
 * with itself but not with reads, so two runs never race to insert the same
 * node and fail on its unique index, while readers carry on.
 */
export const TAGS_LOCK_SQL = "LOCK TABLE tags IN SHARE ROW EXCLUSIVE MODE";
