import type { CalendarSearch } from "../../hooks/use-calendar-search/calendar-search.types";
import type { NightSkyOverrides } from "../../hooks/use-night-sky/use-night-sky.types";

// 🏷️ Types

/**
 * Whether a folder's constellations all show, some do, or none.
 */
export type FolderState = "checked" | "partial" | "unchecked";

/**
 * The settings a slider shows.
 */
export type NumericSkySetting = {
  [Field in keyof NightSkyOverrides]: NightSkyOverrides[Field] extends number
    ? Field
    : never;
}[keyof NightSkyOverrides];

/**
 * A color control: its link key, label, and field.
 */
export interface SkyColorControl {
  field:
    | "backgroundBottomColor"
    | "backgroundTopColor"
    | "eclipticColor"
    | "lineColor";
  key: SkyParameterKey;
  label: string;
}

/**
 * A link key the sky menu sets, such as `sky.lat`.
 */
export type SkyParameterKey = Extract<keyof CalendarSearch, `sky${string}`>;

/**
 * Sky key changes: a value to set, or undefined to reset.
 */
export type SkySearchChange = Partial<Pick<CalendarSearch, SkyParameterKey>>;

/**
 * A slider control: its link key, field, range, step, and unit.
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
