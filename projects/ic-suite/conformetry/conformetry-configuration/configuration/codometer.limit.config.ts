import {
  codometerConfiguration,
  directoryLimits,
} from "../../../../../configuration/ic-suite/codometer.config.js";

export default {
  ...codometerConfiguration,
  // Raised to 32 KB for the template pickers, reserved-name rule, and group-locating rule added here.
  limits: directoryLimits,
};
