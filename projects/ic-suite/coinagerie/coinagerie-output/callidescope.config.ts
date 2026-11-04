import { projectDefaults } from "../../../../configuration/callidescope.config.js";

/**
 * What coinagerie-output is held to, measured rather than assumed.
 *
 * Ten frames from `DeliveryService.check` and `write` down through reading
 * every destination, the markdown parser's line reader, and the error it
 * throws on a malformed block; four callees in the callback `write` maps each
 * destination through.
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
    maximumBreadth: 4,
    maximumDepth: 10,
  },
};
