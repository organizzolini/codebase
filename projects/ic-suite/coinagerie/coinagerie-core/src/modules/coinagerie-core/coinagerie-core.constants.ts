// ♟️ Constants

import type { MalformedGlossaryLocation } from "./coinagerie-core.types";

/** The toolchain's mark, used in its heading and its log lines. */
export const COINAGERIE_EMOJI = "🪙";

/** The comment that opens a markdown glossary block. */
export const COINAGERIE_START_ANCHOR = "<!-- coinagerie:start -->";

/** The comment that closes a markdown glossary block. */
export const COINAGERIE_END_ANCHOR = "<!-- coinagerie:end -->";

/** The heading every markdown glossary block opens with. */
export const COINAGERIE_HEADING = `## ${COINAGERIE_EMOJI} Coinagerie`;

// 🚨 Errors

/** Raised when an explicitly named configuration file does not exist. */
export class ConfigurationFileNotFoundError extends Error {
  constructor(filePath: string) {
    super(`Configuration file not found: ${filePath}`);
    this.name = "ConfigurationFileNotFoundError";
  }
}

/**
 * Raised when a configuration file cannot be loaded or does not satisfy the
 * schema, naming the file so the fault can be found in it.
 */
export class InvalidConfigurationError extends Error {
  constructor(filePath: string, reason: string) {
    super(
      `Cannot read the coinagerie configuration at ${filePath}.\n${reason}`,
    );
    this.name = "InvalidConfigurationError";
  }
}

/**
 * Raised when a glossary destination cannot be fully parsed.
 *
 * Fatal on purpose: a word dropped by a lenient parser reads as stale, and
 * writing the glossary back would then delete its hand-written definition.
 */
export class MalformedGlossaryError extends Error {
  constructor(location: MalformedGlossaryLocation) {
    const where =
      location.line === undefined
        ? location.path
        : `${location.path}:${location.line}`;

    super(`Cannot parse the glossary at ${where}: ${location.reason}`);
    this.name = "MalformedGlossaryError";
  }
}
