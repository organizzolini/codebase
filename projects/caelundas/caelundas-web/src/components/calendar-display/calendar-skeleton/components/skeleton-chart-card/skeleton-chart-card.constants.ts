import { listKeys } from "../../calendar-skeleton.utilities";

// ♟️ Constants

export const TICK_KEYS = listKeys("tick", 5);

export const COLUMN_KEYS = listKeys("column", 7);

/**
 * Where the plot's rules fall, as a share of its height.
 */
export const RULES = ["0%", "25%", "50%", "75%", "100%"] as const;
