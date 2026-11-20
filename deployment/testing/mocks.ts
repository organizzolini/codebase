import path from "node:path";

/** Workspaces go in this project, never the OS temp directory. */
export const TEMPORARY_ROOT = path.resolve(import.meta.dirname, "../tmp");
