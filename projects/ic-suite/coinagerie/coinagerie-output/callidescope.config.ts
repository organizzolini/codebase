import { projectDefaults } from "../../../../configuration/callidescope.config.js";

/**
 * What coinagerie-output is held to.
 *
 * One, because the package is empty: it exports nothing and calls nothing yet.
 * The first ticket that adds behavior measures it and raises these numbers to
 * what that code does, set **at** the measurement rather than above it.
 *
 * @see configuration/callidescope.config.ts — `projectDefaults`, spread below
 * for everything this file does not override
 */
export default {
  ...projectDefaults,
  limits: {
    maximumBreadth: 1,
    maximumDepth: 1,
  },
};
