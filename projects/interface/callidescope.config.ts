import { projectDefaults } from "../../projects/configuration/callidescope.config.js";

export default {
  ...projectDefaults,
  limits: {
    maximumBreadth: 7,
    maximumDepth: 7,
  },
};
