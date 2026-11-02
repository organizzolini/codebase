import type { CalendarSearch } from "../../hooks/use-calendar-search/calendar-search.types";
import type { NightSkyOverrides } from "../../hooks/use-night-sky/use-night-sky.types";

// 🏷️ Types

/**
 * The settings a slider shows.
 */
export type NumericSkySetting = {
  [Field in keyof NightSkyOverrides]: NightSkyOverrides[Field] extends number
    ? Field
    : never;
}[keyof NightSkyOverrides];

/**
 * One color the menu picks, the link key it writes and the setting it shows.
 */
export interface SkyColorControl {
  field: "backgroundBottomColor" | "backgroundTopColor" | "lineColor";
  key: SkyParameterKey;
  label: string;
}

/**
 * A key of the link the Night sky menu sets, such as `sky.lat`.
 */
export type SkyParameterKey = Extract<keyof CalendarSearch, `sky${string}`>;

/**
 * A change to the link's sky keys: a value to set, or undefined to remove
 * one, which leaves it at its default.
 */
export type SkySearchChange = Partial<Pick<CalendarSearch, SkyParameterKey>>;

/**
 * One number the menu sets with a slider: its link key, the setting it
 * shows, its range and step, and the unit it is read in.
 */
export interface SkySliderControl {
  field: NumericSkySetting;
  key: SkyParameterKey;
  label: string;
  maximum: number;
  minimum: number;
  step: number;
  unit: string;
}
