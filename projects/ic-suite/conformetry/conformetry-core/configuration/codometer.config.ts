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
  limits: [
    ...directoryLimits,
    { metric: "Compiled JavaScript.size", value: "2 KB" },
  ],
};
