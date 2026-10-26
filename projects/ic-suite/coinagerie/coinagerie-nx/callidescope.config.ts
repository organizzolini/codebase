import { projectDefaults } from "../../../../configuration/callidescope.config.js";

/**
 * What coinagerie-nx is held to, measured rather than assumed.
 *
 * Six frames from the `createNodes` callback down through `inferTargets`, the
 * option reader, and the input reader's per-entry callback to its object
 * guard, and four callees in `inferTargets`, which resolves the options and
 * tests each file's folder before building its target.
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
    maximumDepth: 6,
  },
};
