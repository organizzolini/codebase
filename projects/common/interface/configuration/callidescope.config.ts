import { projectDefaults } from "../../../../configuration/ic-suite/callidescope.config.js";

export default {
  ...projectDefaults,
  limits: {
    maximumBreadth: 7,
    maximumDepth: 7,
  },
};
