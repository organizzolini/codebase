import { memo } from "react";

import { TableEventRow } from "./components/table-event-row/table-event-row";
import { areEventRowsEqual } from "./components/table-event-row/table-event-row.utilities";
import { TableGroupRow } from "./components/table-group-row/table-group-row";
import { TableMoreRow } from "./components/table-more-row/table-more-row";

// ♟️ Constants

/**
 * The event row, drawn again only when its data changes.
 */
export const MemoEventRow = memo(TableEventRow, areEventRowsEqual);

/**
 * The group row, drawn again only when its props change.
 */
export const MemoGroupRow = memo(TableGroupRow);

/**
 * The row showing more of a list, memoized.
 */
export const MemoMoreRow = memo(TableMoreRow);
