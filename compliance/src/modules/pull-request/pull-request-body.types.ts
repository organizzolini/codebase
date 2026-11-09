// 🏷️ Types

/**
 * Everything wrong with one pull request description, all reported in one pass.
 */
export interface BodyVerdict {
  readonly emptySections: readonly string[];
  readonly malformedSections: readonly string[];
  readonly missingHeadings: readonly string[];
  readonly oversizedSections: readonly string[];
  readonly unfilledComments: readonly string[];
}

/** What one required section may hold, and how many words it may run to. */
export interface SectionRule {
  readonly heading: string;
  readonly maximumWords?: number;
  readonly shape: SectionShape;
}

/** The one kind of markdown block a section may be made of. */
export type SectionShape =
  | "bullet-list"
  | "leading-dash-list"
  | "ordered-list"
  | "paragraph";
