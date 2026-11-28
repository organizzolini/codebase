import {
  codometerConfiguration,
  compiledJavaScriptTarget,
  directoryLimits,
} from "../../../../configuration/ic-suite/codometer.config.js";

export default {
  ...codometerConfiguration,
  inputs: [
    {
      ...compiledJavaScriptTarget,
      include: ["dist/**/*.js"],
    },
    // The bundle the image ships, weighed by `codometer-weigh` after `bundle` builds it. The glob
    // reaches the pnpm store explicitly, since discovery skips `node_modules`.
    {
      analyses: ["size"],
      compression: "none",
      directory: "../../../dist/caelundas-cli",
      include: ["**/*", "node_modules/.pnpm/**/*"],
      name: "Application Bundle",
    },
  ],
  limits: [
    ...directoryLimits,
    { metric: "Compiled JavaScript.size", value: "384 KB" },
    // Measured at 7,940 files and 27.25 MB: about 10% above, so a new dependency fails the build.
    { metric: "Application Bundle.files", value: 8700 },
    { metric: "Application Bundle.size", value: "30 MB" },
  ],
};
