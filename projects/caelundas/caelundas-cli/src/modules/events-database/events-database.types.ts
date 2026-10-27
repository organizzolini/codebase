// 🏷️ Types

/** A build with its defaults resolved: the file to write, and the file to copy, or none for the seed. */
export interface EventsDatabaseBuild {
  output: string;
  source?: string;
}

/** The options the `events-database` command line carries. */
export interface EventsDatabaseCommandOptions {
  /** Where the bundle is written; `output/events.sqlite` when omitted. */
  output?: string;

  /** Builds from the committed seed rows instead of an ingested database. */
  seed?: boolean;

  /** The ingested database to build from; the one a run writes when omitted. */
  source?: string;
}
