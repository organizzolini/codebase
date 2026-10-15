import path from "node:path";
import { fileURLToPath } from "node:url";

import { createViteLibraryConfig } from "../../../../projects/configuration/vite.library.config.ts";

const packageDirectory = path.dirname(fileURLToPath(import.meta.url));

export default createViteLibraryConfig({
  entry: {
    "src/conformetry-nx.main": path.resolve(
      packageDirectory,
      "src/conformetry-nx.main.ts",
    ),
    "src/executors/validate/executor": path.resolve(
      packageDirectory,
      "src/executors/validate/executor.ts",
    ),
    "src/generators/sync/generator": path.resolve(
      packageDirectory,
      "src/generators/sync/generator.ts",
    ),
    "src/index": path.resolve(packageDirectory, "src/index.ts"),
  },
  packageDirectory,
});
