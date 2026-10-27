import { projectDefaults } from "../../../../configuration/callidescope.config.js";

/**
 * What coinagerie-cli is held to, measured rather than assumed.
 *
 * Thirteen frames from `CollectCommand.run` down through delivery into the
 * markdown parser, and five callees in `run`, which loads the configuration,
 * collects the vocabulary, and prints, checks, or writes.
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
    maximumBreadth: 5,
    maximumDepth: 13,
  },
};
