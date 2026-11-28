import path from "node:path";

import { createRolldownApplicationConfig } from "../../../../configuration/typescript/rolldown.application.config.ts";

export default createRolldownApplicationConfig({
  entry: {
    "caelundas-cli.main": "src/caelundas-cli.main.ts",
    "ephemeris-download-cli.main": "src/ephemeris-download-cli.main.ts",
  },
  // The database module loads its migrations by glob.
  globbedDirectories: ["projects/caelundas/caelundas-db/migrations"],
  packageDirectory: path.dirname(import.meta.dirname),
});
