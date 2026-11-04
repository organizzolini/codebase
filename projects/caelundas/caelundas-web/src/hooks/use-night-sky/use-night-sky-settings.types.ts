import type { CalendarSearch } from "../use-calendar-search/calendar-search.types";
import type { ConstellationListing } from "./night-sky.types";
import type { NightSkyOverrides } from "./use-night-sky.types";

// 🏷️ Types

/**
 * What useNightSkySettings returns.
 */
export interface UseNightSkySettingsResult {
  /**
   * Writes a change to the link's sky keys, replacing the history entry; a
   * key set to undefined is removed.
   */
  change: (next: Partial<CalendarSearch>) => void;
  /**
   * Every constellation the database holds, by name, for the figure picker;
   * empty until they load.
   */
  constellations: readonly ConstellationListing[];
  /**
   * The sky's settings as the link sets them, each defaulted where absent.
   */
  settings: NightSkyOverrides;
}
