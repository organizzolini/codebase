// 🏷️ Types

/**
 * A field the cascader offers, under its category.
 */
export interface PickerField {
  /** What the field is measured in, or empty for a field with no group. */
  category: string;
  description: string;
  /** What the link and the API name the field by. */
  key: string;
  label: string;
}
