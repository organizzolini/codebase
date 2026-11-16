import {
  codometerConfiguration,
  compiledJavaScriptTarget,
} from "../../../../../configuration/ic-suite/codometer.config.js";

export default {
  ...codometerConfiguration,
  inputs: [
    {
      ...compiledJavaScriptTarget,
      include: ["dist/**/*.js"],
    },
  ],
  limits: [{ metric: "Compiled JavaScript.size", value: "64 KB" }],
};
