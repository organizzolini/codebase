import { z } from "zod";

// ♟️ Constants

/** The file naming the Node version the workspace runs, relative to the working directory. */
export const NODE_VERSION_FILE = ".nvmrc";

/** Every Node release, published by the Node.js project. */
export const NODE_INDEX_URL = "https://nodejs.org/dist/index.json";

/** A version as `.nvmrc` writes it: a `v` and three numbers. */
export const VERSION_PATTERN = /^v(?<major>\d+)\.\d+\.\d+$/u;

/** The only field of a release this module reads. */
export const releasesSchema = z.array(z.object({ version: z.string() }));
