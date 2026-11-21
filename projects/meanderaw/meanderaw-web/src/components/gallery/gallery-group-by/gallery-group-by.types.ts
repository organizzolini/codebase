import type { PickerField } from "../gallery-cascader/gallery-cascader.types";

// 🏷️ Types

/**
 * A field a level may group by: rows, columns or a characteristic.
 */
export interface GroupField extends PickerField {
  /** Whether it holds true or false, which the headers word as held. */
  type: "boolean" | "number";
}
