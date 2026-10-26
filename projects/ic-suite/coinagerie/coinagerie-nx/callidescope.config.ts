import { projectDefaults } from "../../../../configuration/callidescope.config.js";

/**
 * What coinagerie-nx is held to, measured rather than assumed.
 *
 * Five frames from the `createNodes` callback down through `inferTargets` and
 * the option reader to its list guard, and four callees in `readStringList`,
 * which narrows an untrusted value, drops what is not a string, trims, and
 * drops the blanks.
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
    maximumDepth: 5,
  },
};
