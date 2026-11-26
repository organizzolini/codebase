import path from "node:path";

import { createRolldownApplicationConfig } from "../../../../configuration/typescript/rolldown.application.config.ts";

export default createRolldownApplicationConfig({
  entry: { "caelundas-api": "src/caelundas-api.ts" },
  // The database module loads its migrations by glob.
  globbedDirectories: ["projects/caelundas/caelundas-db/migrations"],
  packageDirectory: path.dirname(import.meta.dirname),
  // TypeORM loads its driver, and pino its pretty transport, by name.
  runtimeDependencies: ["pg", "pino-pretty"],
});
