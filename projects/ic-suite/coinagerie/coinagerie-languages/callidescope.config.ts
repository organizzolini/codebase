import { projectDefaults } from "../../../../configuration/callidescope.config.js";

/**
 * What coinagerie-languages is held to, measured rather than assumed.
 *
 * Five frames from the registered TypeScript tokenizer down through the
 * syntax-tree walk to the check for a quoted key, and one callee per
 * callable.
 *
 * Set **at** what the gate measured rather than above it: a stack at the
 * limit passes, so the number is a starting point to ratchet down from rather
 * than a target to grow into.
 *
 * @see configuration/callidescope.config.ts — `projectDefaults`, spread below
 * for everything this file does not override
 */
export default {
  ...projectDefaults,
  limits: {
    maximumBreadth: 7,
    maximumDepth: 6,
  },
};
