import { projectDefaults } from "../../configuration/ic-suite/callidescope.config.js";

/**
 * What integration is held to, measured rather than assumed.
 *
 * Depth is the 10 the synchronization commands were already held to, now that
 * they are measured here; each number is a limit to ratchet down from, never a
 * target to grow into.
 *
 * @see configuration/ic-suite/callidescope.config.ts — `projectDefaults`, spread below
 * for everything this file does not override
 */
export default {
  ...projectDefaults,
  limits: {
    maximumBreadth: 8,
    maximumDepth: 10,
  },
};
