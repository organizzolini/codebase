// 🏷️ Types

/**
 * A field a level may group by.
 */
export interface GroupField {
  /** What a link and the API name it by. */
  key: string;
  label: string;
  /** Whether it holds true or false, which the headers word as held. */
  type: "boolean" | "number" | "text";
}
