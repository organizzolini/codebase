import {
  codometerConfiguration,
  compiledJavaScriptTarget,
} from "../../../../configuration/codometer.config.js";

export default {
  ...codometerConfiguration,
  inputs: [
    {
      ...compiledJavaScriptTarget,
      include: ["dist/**/*.js"],
    },
  ],
  // Raised to 32 KB for the template filters and reports added to `generate` and `validate`.
  limits: [{ metric: "Compiled JavaScript.size", value: "32 KB" }],
};
