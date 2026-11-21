import {
  codometerConfiguration,
  commentBudgetLimits,
  customStatistics,
} from "../../configuration/ic-suite/codometer.config.js";

// The documentation project keeps numbered records and plans in flat folders,
// so it is measured without the directory ceilings every other project gates.
export default {
  ...codometerConfiguration,
  custom: customStatistics,
  limits: commentBudgetLimits,
};
