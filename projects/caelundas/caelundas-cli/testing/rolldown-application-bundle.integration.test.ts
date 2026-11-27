import path from "node:path";

import { build } from "rolldown";

import { describeApplicationBundle } from "@codebase/testing";

import rolldownConfiguration from "../configuration/rolldown.config";

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../../..");

describeApplicationBundle({
  bundle: async () => build(rolldownConfiguration),
  directory: path.join(WORKSPACE_ROOT, "dist/caelundas-cli"),
  entry: ["caelundas-cli.main.js", "caelundas"],
  invalid: {
    environment: { CAELUNDAS_POSTGRES_HOST: "localhost" },
    files: { "configuration/.env": 'START_DATE="not-a-date"\n' },
    message: "START_DATE must be in YYYY-MM-DD format",
  },
  // 934,080 bytes today, plus a margin.
  maximumFileBytes: 1_100_000,
  packages: ["@nestjs/core", "pg", "pino-pretty", "sweph", "typeorm"],
  workspaceRoot: WORKSPACE_ROOT,
});
