import { projectDefaults } from "../../../../configuration/callidescope.config.js";

/**
 * What coinagerie-configuration is held to, measured rather than assumed.
 *
 * Three frames to locate a configuration file and refuse a missing one, and
 * three callees in both `loadConfiguration` and `locate`.
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
    maximumBreadth: 3,
    maximumDepth: 3,
  },
};
