import path from "node:path";
import { fileURLToPath } from "node:url";

import { createViteLibraryConfig } from "../../../../configuration/vite.library.config.ts";

const packageDirectory = path.dirname(fileURLToPath(import.meta.url));

export default createViteLibraryConfig({
  entry: {
    "src/executors/check/batch-executor": path.resolve(
      packageDirectory,
      "src/executors/check/batch-executor.ts",
    ),
    "src/executors/check/executor": path.resolve(
      packageDirectory,
      "src/executors/check/executor.ts",
    ),
    "src/index": path.resolve(packageDirectory, "src/index.ts"),
  },
  packageDirectory,
});
