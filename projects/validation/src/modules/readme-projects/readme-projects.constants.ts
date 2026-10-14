// ♟️ Constants

/** The directories a workspace project may live in, nested by domain. */
export const WORKSPACE_SCOPES = ["projects"];

/** The root README this check reads and enforces project coverage against. */
export const ROOT_README_PATH = "README.md";

/** Files that make a directory a project: a manifest or an Nx project file. */
export const PROJECT_MARKER_FILES = ["package.json", "project.json"];
