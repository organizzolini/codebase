import { projectDefaults } from "../../configuration/callidescope.config.js";

/**
 * The deepest stack and widest callable measured for compliance.
 *
 * Set at the measured values so either limit can be boundary-tested directly.
 */
export default {
  ...projectDefaults,
  limits: {
    maximumBreadth: 9,
    maximumDepth: 8,
  },
};
