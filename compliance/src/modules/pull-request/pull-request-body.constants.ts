// ♟️ Constants

import type { SectionRule, SectionShape } from "./pull-request-body.types";

/** The template every pull request description starts as. */
export const PULL_REQUEST_TEMPLATE_PATH = ".github/PULL_REQUEST_TEMPLATE.md";

/**
 * Sections a description must carry, read here rather than from the template,
 * so a template edit cannot silently drop one.
 */
export const SECTION_RULES: readonly SectionRule[] = [
  { heading: "## 🌰 Summary", maximumWords: 48, shape: "paragraph" },
  { heading: "## 📝 Details", maximumWords: 512, shape: "bullet-list" },
  { heading: "## 🧪 Testing", shape: "ordered-list" },
  { heading: "## 🔗 Related", shape: "leading-dash-list" },
];

/** The four headings alone, as a description must carry them verbatim. */
export const REQUIRED_HEADINGS = SECTION_RULES.map((rule) => rule.heading);

/** How each shape is named in a failure and in the guidance. */
export const SECTION_SHAPE_DESCRIPTIONS: Readonly<
  Record<SectionShape, string>
> = {
  "bullet-list": "only a bulleted list, one marker throughout",
  "leading-dash-list": "a list whose items start with `-`, then anything",
  "ordered-list": "only an ordered list",
  paragraph: "only one plain paragraph",
};

/** How a `<!-- … -->` prompt is recognized in the template. */
export const TEMPLATE_COMMENT_PATTERN = /<!--[\S\s]*?-->/gu;

/**
 * How much of a template comment must survive to count as unfilled. A prefix,
 * so an edited prompt still counts.
 */
export const TEMPLATE_COMMENT_PREFIX_LENGTH = 40;

/** Said when there is no description to check at all. */
export const BODY_MISSING_MESSAGE = "❌ Unable to determine Pull Request Body";

/** How the five failure lists are introduced. */
export const MISSING_HEADINGS_MESSAGE = "❌ Missing required sections:";
export const EMPTY_SECTIONS_MESSAGE = "❌ Empty required sections:";
export const UNFILLED_COMMENTS_MESSAGE =
  "❌ Unfilled template comments remain:";
export const OVERSIZED_SECTIONS_MESSAGE = "❌ Sections over their word limit:";
export const MALFORMED_SECTIONS_MESSAGE =
  "❌ Sections not in their required shape:";

/** The closing lines, printed after any failure. */
export const BODY_GUIDANCE_LINES = [
  `PR description must include: ${REQUIRED_HEADINGS.join(", ")}, with every template comment replaced by real content.`,
  `Section shapes: ${SECTION_RULES.map(
    (rule) =>
      `${rule.heading.replace("## ", "")} holds ${SECTION_SHAPE_DESCRIPTIONS[rule.shape]}${rule.maximumWords === undefined ? "" : ` (at most ${String(rule.maximumWords)} words)`}`,
  ).join("; ")}.`,
  `See: ${PULL_REQUEST_TEMPLATE_PATH}`,
];
