// ♟️ Constants

/** Ephemeris files for planets, Moon, asteroids; `18` is the century. */
export const EPHEMERIS_FILENAMES = [
  "seas_18.se1",
  "sepl_18.se1",
  "semo_18.se1",
] as const;

/** Where the files are published. */
export const EPHEMERIS_BASE_URL =
  "https://raw.githubusercontent.com/aloistr/swisseph/master/ephe";

/** Where the files live, relative to the directory the CLI runs from. */
export const EPHEMERIS_DIRECTORY = "./data/ephemeris";

/** Suffix marking a file mid-download, so partials never pass. */
export const PARTIAL_FILE_SUFFIX = ".part";

/** The command that fetches the files, named in every error about them. */
export const DOWNLOAD_COMMAND = "nx run caelundas-cli:download-ephemeris";

/** The first year the data files cover. */
export const EPHEMERIS_FIRST_YEAR = 1800;

/** The last year the data files cover. */
export const EPHEMERIS_LAST_YEAR = 2399;

/**
 * Data files that are absent or empty. Without them the Swiss Ephemeris falls
 * back to a less precise built-in one without saying so, so a run stops here
 * instead.
 */
export class EphemerisFilesMissingError extends Error {
  constructor(directory: string, missing: readonly string[]) {
    super(
      `Swiss Ephemeris files are missing from ${directory}: ${missing.join(", ")}. Download them with \`${DOWNLOAD_COMMAND}\`.`,
    );
    this.name = EphemerisFilesMissingError.name;
    this.directory = directory;
    this.missing = missing;
  }
  readonly directory: string;
  readonly missing: readonly string[];
}
