// ♟️ Constants

// 🚨 Errors

/**
 * Raised when a run names no configuration path.
 *
 * Codometer never searches for a configuration or assumes one, so the path is
 * always the caller's to supply; the message names the surface that failed to
 * supply it, such as the `--config` flag.
 */
export class ConfigurationPathRequiredError extends Error {
  constructor(surface: string) {
    super(
      `${surface} is required: codometer never searches for or assumes a configuration file. Pass the path to a codometer configuration file, such as codometer.config.ts.`,
    );
    this.name = "ConfigurationPathRequiredError";
  }
}

/** What `--check limits` asks the run to fail on: a breached failing limit. */
export const CHECK_LIMITS = "limits";

/** What `--check reports` asks the run to fail on: a stale written report. */
export const CHECK_REPORTS = "reports";

/**
 * Everything `--check` accepts, in error-message order.
 *
 * Named once so the check and its message cannot drift apart.
 */
export const CHECK_NAMES = [CHECK_LIMITS, CHECK_REPORTS];

/** How a `--check` value is written: one comma-separated set, no spaces needed. */
export const CHECK_SEPARATOR = ",";

/** What `--format json` prints: the report, as a document something can parse. */
export const FORMAT_JSON = "json";

/** What `--format markdown` prints: the rendered badge document. */
export const FORMAT_MARKDOWN = "markdown";

/**
 * Everything `--format` accepts, in error-message order.
 *
 * A format added here is accepted everywhere the moment it is rendered.
 */
export const FORMAT_NAMES = [FORMAT_JSON, FORMAT_MARKDOWN] as const;
