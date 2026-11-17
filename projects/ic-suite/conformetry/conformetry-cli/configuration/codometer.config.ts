import {
  codometerConfiguration,
  compiledJavaScriptTarget,
  directoryLimits,
} from "../../../../../configuration/ic-suite/codometer.config.js";

export default {
  ...codometerConfiguration,
  inputs: [
    {
      ...compiledJavaScriptTarget,
      include: ["dist/**/*.js"],
    },
  ],
  // Raised to 32 KB for the template filters and reports added to `generate` and `validate`.
  limits: [
    ...directoryLimits,
    { metric: "Compiled JavaScript.size", value: "32 KB" },
  ],
};
