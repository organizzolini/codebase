import path from "node:path";
import { fileURLToPath } from "node:url";

import { createViteLibraryConfig } from "../../../../projects/configuration/vite.library.config.ts";

const packageDirectory = path.dirname(fileURLToPath(import.meta.url));

export default createViteLibraryConfig({
  entry: {
    "src/callidescope-cli.main": path.resolve(
      packageDirectory,
      "src/callidescope-cli.main.ts",
    ),
    "src/index": path.resolve(packageDirectory, "src/index.ts"),
  },
  packageDirectory,
});
