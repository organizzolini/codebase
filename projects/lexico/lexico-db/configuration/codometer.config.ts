import {
  codometerConfiguration,
  compiledJavaScriptTarget,
  directoryLimits,
} from "@codebase/configuration/codometer.config";

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
    { metric: "Compiled JavaScript.size", value: "64 KB" },
  ],
};
