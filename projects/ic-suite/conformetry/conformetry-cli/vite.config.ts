import path from "node:path";
import { fileURLToPath } from "node:url";

import { createViteLibraryConfig } from "../../../../projects/configuration/vite.library.config.ts";

const packageDirectory = path.dirname(fileURLToPath(import.meta.url));

export default createViteLibraryConfig({
  entry: {
    "src/conformetry-cli.main": path.resolve(
      packageDirectory,
      "src/conformetry-cli.main.ts",
    ),
    "src/index": path.resolve(packageDirectory, "src/index.ts"),
  },
  packageDirectory,
});
