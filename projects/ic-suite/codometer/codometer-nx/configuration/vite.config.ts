import path from "node:path";
import { fileURLToPath } from "node:url";

import { createViteLibraryConfig } from "../../../../../configuration/typescript/vite.library.config.ts";

const packageDirectory = path.dirname(
  path.dirname(fileURLToPath(import.meta.url)),
);

export default createViteLibraryConfig({
  entry: {
    "src/executors/measure/batch-executor": path.resolve(
      packageDirectory,
      "src/executors/measure/batch-executor.ts",
    ),
    "src/executors/measure/executor": path.resolve(
      packageDirectory,
      "src/executors/measure/executor.ts",
    ),
    "src/index": path.resolve(packageDirectory, "src/index.ts"),
  },
  packageDirectory,
});
