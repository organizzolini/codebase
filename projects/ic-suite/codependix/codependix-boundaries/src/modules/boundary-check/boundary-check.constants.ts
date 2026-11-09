// ♟️ Constants

import path from "node:path";

import type { CodependixBoundaryLevel } from "../boundaries/boundaries.types";

/**
 * The `scope` of the whole-workspace Nx graph. Its findings are charged to
 * the projects owning their nodes, see `BoundariesService.chargeProjects`.
 */
export const WORKSPACE_SCOPE = "workspace";

/**
 * Judging order, cheapest first. Nx reuses a graph the run already holds;
 * NestJS boots containers and TypeScript builds a `ts.Program`.
 */
export const BOUNDARY_LEVEL_ORDER = [
  "nxProjects",
  "nestjsModules",
  "typescript",
  "python",
] as const satisfies readonly CodependixBoundaryLevel[];

/**
 * What every V8 stack frame line starts with once its indentation is
 * trimmed: `at name (location:line:column)` or a bare `at location:line:column`.
 */
export const STACK_FRAME_PREFIX = "at ";

/**
 * A frame's line or column number. Anchored at both ends, so a crafted
 * frame cannot trigger backtracking.
 */
export const FRAME_POSITION = /^\d+$/u;

/**
 * The path segment marking a frame as third-party code. Such a frame never
 * names an owner, even under a project's root.
 */
export const NODE_MODULES_SEGMENT = `${path.sep}node_modules${path.sep}`;

/**
 * The indent that keeps a Markdown bullet's continuation line inside it —
 * the width of the `- ` marker.
 */
export const CONTINUATION_INDENT = "  ";

/**
 * The heading of the one Markdown group holding every failure charged to
 * every judged project, in place of a copy under each of them.
 */
export const WORKSPACE_GROUP_HEADING = "All judged projects";
