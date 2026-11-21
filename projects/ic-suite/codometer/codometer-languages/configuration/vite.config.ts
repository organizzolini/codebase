import path from "node:path";
import { fileURLToPath } from "node:url";

import { createViteLibraryConfig } from "../../../../../configuration/typescript/vite.library.config.ts";

export default createViteLibraryConfig({
  packageDirectory: path.dirname(path.dirname(fileURLToPath(import.meta.url))),
});
