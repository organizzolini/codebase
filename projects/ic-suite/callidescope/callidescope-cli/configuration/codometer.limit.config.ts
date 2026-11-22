import {
  codometerConfiguration,
  directoryLimits,
} from "../../../../../configuration/ic-suite/codometer.config.js";

export default {
  ...codometerConfiguration,
  limits: directoryLimits,
};
