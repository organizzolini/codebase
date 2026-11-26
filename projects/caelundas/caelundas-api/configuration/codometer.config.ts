import { codometerConfiguration } from "@codebase/configuration/codometer.config";

export default {
  ...codometerConfiguration,
  inputs: [
    // The bundle the image ships, weighed by `codometer-weigh` after `bundle` builds it. The glob
    // reaches the pnpm store explicitly, since discovery skips `node_modules`.
    {
      analyses: ["size"],
      compression: "none",
      directory: "../../../dist/caelundas-api",
      include: ["**/*", "node_modules/.pnpm/**/*"],
      name: "Application Bundle",
    },
  ],
  limits: [
    // Measured at 11,643 files and 41.39 MB: about 10% above, so a new dependency fails the build.
    { metric: "Application Bundle.files", value: 12800 },
    { metric: "Application Bundle.size", value: "45 MB" },
  ],
};
