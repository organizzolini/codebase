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
   * Merges a derivational family into one headword, such as `configuration`
   * into `configure`. Runs after plurals and inflections have been folded, so
   * it sees lemmas rather than every surface form, and must return a
   * non-empty string.
   */
  fold?: FoldWord | undefined;
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
  /**
   * Words left out of the glossary, as a list or as a function returning one,
   * synchronously or not — the function is where a configuration reads
   * whatever else it wants to exclude. Exclusion applies after folding, so
   * excluding `service` also covers `services`. Defaults to none.
   */
  words?: ExcludedWords | undefined;
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
export type CoinagerieOutput = CoinagerieMarkdownOutput;

/** A list of words, or a function that returns one. */
export type ExcludedWords = (() => Promise<string[]> | string[]) | string[];

/** A function from a word to the headword it is folded into. */
export type FoldWord = (word: string) => string;

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

/** What reading a configuration file yields: its export and its excluded words. */
export interface LoadedConfiguration {
  configuration: CoinagerieConfiguration;
  /** `exclude.words` once any function in it has been called. */
  words: string[];
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
  /** `words` is the resolved list: a function in the file has been called. */
  exclude: { paths: string[]; words: string[] };
  /**
   * The configured fold, wrapped so that a throw or an empty or non-string
   * result raises an `InvalidConfigurationError` naming the file; `undefined`
   * when none is configured.
   */
  fold: FoldWord | undefined;
  include: string[];
  outputs: ResolvedCoinagerieOutput[];
}

/** A markdown destination whose path has been made absolute. */
export interface ResolvedCoinagerieMarkdownOutput {
  description: string | undefined;
  path: string;
  type: "markdown";
}

/** One destination, resolved. */
export type ResolvedCoinagerieOutput = ResolvedCoinagerieMarkdownOutput;
