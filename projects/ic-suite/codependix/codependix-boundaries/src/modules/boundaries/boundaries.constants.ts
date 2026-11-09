// ♟️ Constants

/** How a cycle's nodes are joined when one is reported. */
export const CYCLE_SEPARATOR = " → ";

/**
 * The sentence an `acyclic` rule reports when it names none.
 * Names the whole path, since the closing edge alone says little.
 */
export const describeCycle = (args: {
  cycle: readonly string[];
  rule: string;
}): string => `${args.rule}: ${args.cycle.join(CYCLE_SEPARATOR)} is a cycle.`;

/**
 * The sentence an `allow` rule reports when it names none.
 * Worded as what is permitted, since readers next ask what the rule allows.
 */
export const describeDisallowedEdge = (args: {
  rule: string;
  source: string;
  target: string;
}): string =>
  `${args.rule}: ${args.source} may not depend on ${args.target}, which the rule's allowed targets do not cover.`;

/** The sentence a violated `forbid` rule reports when it names none of its own. */
export const describeForbiddenEdge = (args: {
  rule: string;
  source: string;
  target: string;
}): string => `${args.rule}: ${args.source} must not depend on ${args.target}.`;
