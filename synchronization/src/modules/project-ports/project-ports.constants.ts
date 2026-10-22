// ♟️ Constants

import type { PortSource } from "./project-ports.types";

/** The directory every project lives under, directly or one domain folder down. */
export const PROJECTS_DIRECTORY = "projects";

/** Hash multiplier of the rolling hash a port is derived with. */
export const PORT_HASH_MULTIPLIER = 31;

/** How many ports the hash spreads over; every step is a bijection because 31 shares no factor with it. */
export const PORT_HASH_MODULUS = 9000;

/** The lowest port the hash produces, so every port is in 1000-9999. */
export const PORT_HASH_OFFSET = 1000;

/** Where each kind of application declares the port it serves on, found by its project name's suffix. */
export const PORT_SOURCES: readonly PortSource[] = [
  {
    filePath: ".env.default",
    pattern: /^\w+_API_PORT=(\d+)$/m,
    suffix: "-api",
  },
  { filePath: "vite.config.mts", pattern: /\bport:\s*(\d+)/, suffix: "-web" },
];

/** A line has to look like it is about a port before a number on it is rewritten, so an unrelated `3000` stays. */
export const PORT_LINE_CONTEXT = /port|localhost|127\.0\.0\.1/i;

/** Directories no port is ever rewritten in. */
export const SKIPPED_DIRECTORIES: ReadonlySet<string> = new Set([
  ".git",
  ".nx",
  ".output",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "tmp",
]);

/** Files no port is ever rewritten in: history and lockfiles record what was, not what is. */
export const SKIPPED_FILES: ReadonlySet<string> = new Set([
  "CHANGELOG.md",
  "pnpm-lock.yaml",
]);

/** Files larger than this are not text a port lives in. */
export const MAXIMUM_FILE_BYTES = 1_000_000;
