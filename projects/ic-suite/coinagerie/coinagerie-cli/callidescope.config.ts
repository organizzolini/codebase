import { projectDefaults } from "../../../../configuration/callidescope.config.js";

/**
 * What coinagerie-cli is held to.
 *
 * One, because the host is empty: its main only boots an empty module.
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
