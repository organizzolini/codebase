import { projectDefaults } from "../../configuration/callidescope.config.js";

/**
 * What publication is held to, measured rather than assumed.
 *
 * A starting point, set at the defaults until the commands exist to measure;
 * each number is a limit to ratchet down from, never a target to grow into.
 *
 * @see configuration/callidescope.config.ts — `projectDefaults`, spread below
 * for everything this file does not override
 */
export default {
  ...projectDefaults,
  limits: {
    maximumBreadth: 8,
    maximumDepth: 6,
  },
};
