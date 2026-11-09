// ♟️ Constants

/**
 * Weight a finding carries when it declares none. Right for any leaf
 * requirement, which is most of them.
 */
export const DEFAULT_ERROR_WEIGHT = 1;

/**
 * Score for a document imposing no requirements. An empty template asks for
 * nothing and the instance supplies exactly that, so it conforms perfectly.
 */
export const EMPTY_TEMPLATE_SCORE = 1;

/** The highest possible score: every template requirement is honoured. */
export const PERFECT_SCORE = 1;
