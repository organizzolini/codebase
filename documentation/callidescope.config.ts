import { projectDefaults } from "../configuration/callidescope.config.js";

export default {
  ...projectDefaults,
  limits: {
    maximumBreadth: 8,
    maximumDepth: 6,
  },
};
