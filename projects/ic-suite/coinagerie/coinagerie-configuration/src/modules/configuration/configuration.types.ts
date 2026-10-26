// 🏷️ Types

/**
 * What a `coinagerie.config.ts` exports by default.
 *
 * Every field is optional, and every path in it is relative to the folder the
 * file sits in — that folder is also the root the run scans.
 */
export interface CoinagerieConfiguration {
  exclude?: CoinagerieExclusions | undefined;
  /**
   * Globs naming the files the run scans, matched with `path.matchesGlob`.
   * Defaults to every file, dot-files included.
   */
  include?: string[] | undefined;
  /** Where the glossary is kept. With none, a run only prints it. */
  outputs?: CoinagerieOutput[] | undefined;
}

/** What a run leaves out, on top of whatever `.gitignore` already ignores. */
export interface CoinagerieExclusions {
  /** Globs naming files left out of the scan. */
  paths?: string[] | undefined;
}

/**
 * A JSON destination: the whole file is the glossary, a flat object sorted by
 * word with `""` for a word nobody has defined yet.
 */
export interface CoinagerieJsonOutput {
  path: string;
  type: "json";
}

/**
 * A markdown destination: the glossary block is kept between the
 * `coinagerie:start` and `coinagerie:end` anchors of this file, and appended
 * to its end when the file has no anchors yet.
 */
export interface CoinagerieMarkdownOutput {
  /** Rendered under the heading, telling a reader what the block is. */
  description?: string | undefined;
  path: string;
  type: "markdown";
}

/** One place a glossary is kept. */
export type CoinagerieOutput = CoinagerieJsonOutput | CoinagerieMarkdownOutput;

/** What `loadConfiguration` is asked for. */
export interface LoadConfigurationArguments {
  /**
   * A configuration file named on the command line, relative to the working
   * directory. Without one, the working directory is searched for a file
   * named in `CONFIGURATION_FILE_NAMES`, and defaults apply when none exists.
   */
  configurationPath?: string | undefined;
  /** Absolute path the command was run from. */
  workingDirectory: string;
}

/**
 * A configuration with every default filled in and every path absolute.
 *
 * What the rest of the toolchain reads: nothing past this point has to know
 * whether a value was written or defaulted.
 */
export interface ResolvedCoinagerieConfiguration {
  /** The file read, or `undefined` when the run uses only defaults. */
  configurationPath: string | undefined;
  /** The root the run scans: the configuration file's folder, or the
   * working directory when there is no file. */
  directory: string;
  exclude: { paths: string[] };
  include: string[];
  outputs: ResolvedCoinagerieOutput[];
}

/** A JSON destination whose path has been made absolute. */
export interface ResolvedCoinagerieJsonOutput {
  path: string;
  type: "json";
}

/** A markdown destination whose path has been made absolute. */
export interface ResolvedCoinagerieMarkdownOutput {
  description: string | undefined;
  path: string;
  type: "markdown";
}

/** One destination, resolved. */
export type ResolvedCoinagerieOutput =
  | ResolvedCoinagerieJsonOutput
  | ResolvedCoinagerieMarkdownOutput;
