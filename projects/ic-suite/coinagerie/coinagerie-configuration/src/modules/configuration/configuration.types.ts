// 🏷️ Types

/** A `coinagerie.config.ts` default export; paths are relative to its folder. */
export interface CoinagerieConfiguration {
  exclude?: CoinagerieExclusions | undefined;
  /**
   * Merges a derivational family into one headword, such as `configuration`
   * into `configure`. Receives lemmas and must return a non-empty string.
   */
  fold?: FoldWord | undefined;
  /**
   * Globs naming the files the run scans, matched with `path.matchesGlob`.
   * Defaults to every file, dot-files included.
   */
  include?: string[] | undefined;
  /** Where the glossary is kept. With none, a run only prints it. */
  outputs?: CoinagerieOutput[] | undefined;
  /**
   * Words listed exactly as written, skipping every fold: `pisces` stays
   * `pisces` rather than losing its last letter.
   */
  unfolded?: string[] | undefined;
}

/** What a run leaves out, on top of whatever `.gitignore` already ignores. */
export interface CoinagerieExclusions {
  /** Globs naming files left out of the scan. */
  paths?: string[] | undefined;
  /**
   * Words left out of the glossary: a list, or a function returning one.
   * Excluding `service` also excludes `services`, since exclusion applies after
   * folding.
   */
  words?: ExcludedWords | undefined;
}

/** A JSON destination: a flat object, `""` for undefined words. */
export interface CoinagerieJsonOutput {
  path: string;
  type: "json";
}

/** Markdown destination: block between `coinagerie:start` and `coinagerie:end`, appended if absent. */
export interface CoinagerieMarkdownOutput {
  /** Rendered under the heading, telling a reader what the block is. */
  description?: string | undefined;
  path: string;
  type: "markdown";
}

/** One place a glossary is kept. */
export type CoinagerieOutput = CoinagerieJsonOutput | CoinagerieMarkdownOutput;

/** Flags overriding config fields; paths resolve from the working directory. */
export interface ConfigurationOverrides {
  /** Replaces the description of every markdown destination. */
  description?: string | undefined;
  /** Replaces `exclude.paths`. */
  excludePaths?: string[] | undefined;
  /** Replaces `include`. */
  include?: string[] | undefined;
  /** A JSON destination that replaces the file's `outputs`. */
  outputJson?: string | undefined;
  /** A markdown destination that replaces the file's `outputs`. */
  outputMarkdown?: string | undefined;
}

/** The entries of `exclude.words`, split into exact words and patterns. */
export interface ExcludedEntries {
  /**
   * Regular expressions copied without their `g` and `y` flags, which make
   * `test` stateful and so flip between matching and missing.
   */
  patterns: RegExp[];
  words: string[];
}

/** One entry of `exclude.words`: an exact word, or a pattern matching many. */
export type ExcludedWord = RegExp | string;

/** Excluded words or patterns, or a function returning them. */
export type ExcludedWords =
  | (() => ExcludedWord[] | Promise<ExcludedWord[]>)
  | ExcludedWord[];

/** A function from a word to the headword it is folded into. */
export type FoldWord = (word: string) => string;

/** What `loadConfiguration` is asked for. */
export interface LoadConfigurationArguments {
  /**
   * Command-line config file, relative to the working directory. Without one,
   * the working directory is searched for `CONFIGURATION_FILE_NAMES`, else
   * defaults apply.
   */
  configurationPath?: string | undefined;
  /** What the command line overrides; nothing when absent. */
  overrides?: ConfigurationOverrides | undefined;
  /** Absolute path the command was run from. */
  workingDirectory: string;
}

/** What reading a configuration file yields: its export and its excluded entries. */
export interface LoadedConfiguration {
  configuration: CoinagerieConfiguration;
  /** `exclude.words` once any function in it has been called, split. */
  excluded: ExcludedEntries;
}

/** Every default filled in and every path absolute. */
export interface ResolvedCoinagerieConfiguration {
  /** The file read, or `undefined` when the run uses only defaults. */
  configurationPath: string | undefined;
  /** The root the run scans: the configuration file's folder, or the
   * working directory when there is no file. */
  directory: string;
  /**
   * `words` and `patterns` are resolved: a function in the file has been
   * called, and every entry is either an exact word or a pattern.
   */
  exclude: { paths: string[]; patterns: RegExp[]; words: string[] };
  /**
   * The configured fold, wrapped so a throw or an empty or non-string result
   * raises an `InvalidConfigurationError`; `undefined` when none is configured.
   */
  fold: FoldWord | undefined;
  include: string[];
  outputs: ResolvedCoinagerieOutput[];
  /** Words that skip every fold. */
  unfolded: string[];
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
