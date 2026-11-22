import {
  codometerConfiguration,
  directoryLimits,
} from "../../../../../configuration/ic-suite/codometer.config.js";

export default {
  ...codometerConfiguration,
  // Raised to 32 KB for the template filters and reports added to `generate` and `validate`.
  limits: directoryLimits,
};
