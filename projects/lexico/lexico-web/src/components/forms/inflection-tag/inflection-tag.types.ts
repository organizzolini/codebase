import type { PillBadgeProps } from "@codebase/presentation";

// 🏷️ Types

/** A grammatical category an inflection tag belongs to. */
export type TagCategory =
  | "case"
  | "degree"
  | "gender"
  | "mood"
  | "number"
  | "person"
  | "tense"
  | "verbal"
  | "voice";

/** What a tag shows: its short label, spoken name, and badge color. */
export interface TagDescription {
  label: string;
  name: string;
  variant: PillBadgeProps["variant"];
}
