// ♟️ Constants

import path from "node:path";

import type { CodependixBoundaryLevel } from "../boundaries/boundaries.types";

/** Scope of the whole-workspace Nx graph; findings charge their owners. */
export const WORKSPACE_SCOPE = "workspace";

/** Judging order, cheapest first; Nx reuses a held graph. */
export const BOUNDARY_LEVEL_ORDER = [
  "nxProjects",
  "nestjsModules",
  "typescript",
  "python",
] as const satisfies readonly CodependixBoundaryLevel[];

/** Prefix of every V8 stack frame line, once trimmed. */
export const STACK_FRAME_PREFIX = "at ";

/** Line or column number; anchored to avoid backtracking. */
export const FRAME_POSITION = /^\d+$/u;

/** Path segment marking third-party frames, which never name an owner. */
export const NODE_MODULES_SEGMENT = `${path.sep}node_modules${path.sep}`;

/** Indent keeping a Markdown bullet's continuation inside it. */
export const CONTINUATION_INDENT = "  ";

/** Heading of the single group holding every charged failure. */
export const WORKSPACE_GROUP_HEADING = "All judged projects";
