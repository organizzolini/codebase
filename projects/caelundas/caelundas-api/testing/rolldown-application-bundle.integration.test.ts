import path from "node:path";

import { build } from "rolldown";

import { describeApplicationBundle } from "@codebase/testing";

import rolldownConfiguration from "../configuration/rolldown.config";

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../../..");

describeApplicationBundle({
  bundle: async () => build(rolldownConfiguration),
  directory: path.join(WORKSPACE_ROOT, "dist/caelundas-api"),
  entry: ["caelundas-api.js"],
  invalid: {
    environment: { CAELUNDAS_API_PORT: "not-a-port" },
    files: {},
    message: "Invalid input: expected number, received NaN",
  },
  // 756,731 bytes today, plus a margin.
  maximumFileBytes: 1_100_000,
  packages: ["@nestjs/core", "pg", "pino-pretty", "typeorm"],
  workspaceRoot: WORKSPACE_ROOT,
});
