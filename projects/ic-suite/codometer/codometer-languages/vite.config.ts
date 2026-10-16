import path from "node:path";
import { fileURLToPath } from "node:url";

import { createViteLibraryConfig } from "../../../../projects/configuration/vite.library.config.ts";

export default createViteLibraryConfig({
  packageDirectory: path.dirname(fileURLToPath(import.meta.url)),
});
