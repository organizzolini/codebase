import { z } from "zod";

// ♟️ Constants

/** The manifest the workspace root keeps, relative to the working directory. */
export const MANIFEST_FILE = "package.json";

/** The two fields an upgrade rewrites, which the manifest must hold. */
export const manifestSchema = z.object({
  engines: z.object({ node: z.string() }),
  packageManager: z.string(),
});
