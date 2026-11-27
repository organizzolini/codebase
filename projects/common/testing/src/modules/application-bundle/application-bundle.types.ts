// 🏷️ Types

/** What differs between the applications whose bundle is checked. */
export interface ApplicationBundleExpectations {
  /** Builds the application's bundle into `directory`. */
  readonly bundle: () => Promise<unknown>;
  /** Where the build lands, such as `dist/<application>`. */
  readonly directory: string;
  /** The entry file in the build, then the arguments it runs with. */
  readonly entry: readonly [string, ...string[]];
  /** The run that makes the entry stop. */
  readonly invalid: {
    /** The environment variables the entry runs with. */
    readonly environment: Readonly<Record<string, string>>;
    /** Files the entry runs beside, by path. */
    readonly files: Readonly<Record<string, string>>;
    /** What the entry prints when it stops. */
    readonly message: string;
  };
  /** Heaviest shipped file allowed, in bytes: today's plus a margin. */
  readonly maximumFileBytes: number;
  /** Packages the build installs beside it. */
  readonly packages: readonly string[];
  /** The workspace root, where the shared packages' manifests are. */
  readonly workspaceRoot: string;
}

/** What a check reads of the build: where it is and what its store holds. */
export interface BuiltBundle {
  directory: string;
  storeEntries: () => string[];
}
