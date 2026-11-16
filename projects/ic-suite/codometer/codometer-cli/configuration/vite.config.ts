import path from "node:path";
import { fileURLToPath } from "node:url";

import { createViteLibraryConfig } from "../../../../../configuration/typescript/vite.library.config.ts";

export default createViteLibraryConfig({
  entry: {
    "src/codometer-cli.main": path.resolve(
      path.dirname(path.dirname(fileURLToPath(import.meta.url))),
      "src/codometer-cli.main.ts",
    ),
    "src/index": path.resolve(
      path.dirname(path.dirname(fileURLToPath(import.meta.url))),
      "src/index.ts",
    ),
  },
  packageDirectory: path.dirname(path.dirname(fileURLToPath(import.meta.url))),
});
