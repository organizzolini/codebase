// ♟️ Constants

/** How a cycle's nodes are joined when one is reported. */
export const CYCLE_SEPARATOR = " → ";

/** Default `acyclic` message, naming the whole cycle path. */
export const describeCycle = (args: {
  cycle: readonly string[];
  rule: string;
}): string => `${args.rule}: ${args.cycle.join(CYCLE_SEPARATOR)} is a cycle.`;

/** Default `allow` message, worded as what is permitted. */
export const describeDisallowedEdge = (args: {
  rule: string;
  source: string;
  target: string;
}): string =>
  `${args.rule}: ${args.source} may not depend on ${args.target}, which the rule's allowed targets do not cover.`;

/** Default `forbid` message when a rule names none. */
export const describeForbiddenEdge = (args: {
  rule: string;
  source: string;
  target: string;
}): string => `${args.rule}: ${args.source} must not depend on ${args.target}.`;
