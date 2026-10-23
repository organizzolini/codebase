// ♟️ Constants

import type { ToolName } from "./tools.types";

/** Every tool the command can install. */
export const TOOL_NAMES: readonly ToolName[] = [
  "gitleaks",
  "postgres-client",
  "trivy",
];

/** What `pg_dump --version` prints for the PostgreSQL release the database tests need. */
export const POSTGRES_VERSION_MARKER = "18.";

export const POSTGRES_NOT_18_MESSAGE =
  "pg_dump is not PostgreSQL 18 after the install; the database tests need 18's client tools";

export const NO_TOOLS_MESSAGE = `Name at least one tool to install: ${TOOL_NAMES.join(", ")}`;

const KNOWN_NAMES: ReadonlySet<string> = new Set(TOOL_NAMES);

/** Whether a name asked for is a tool the command can install. */
export const isToolName = (name: string): name is ToolName =>
  KNOWN_NAMES.has(name);

/** Reports names that are not tools the command can install. */
export const unknownToolsMessage = (names: readonly string[]): string =>
  `Unknown tool ${names.join(", ")}; choose from ${TOOL_NAMES.join(", ")}`;

/** Reports a tool the release archives do not carry, which is a mistake in this command. */
export const unknownArchiveToolMessage = (name: string): string =>
  `${name} is not one of the release archive tools`;
