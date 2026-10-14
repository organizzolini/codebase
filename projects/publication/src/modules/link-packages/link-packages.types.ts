// 🏷️ Types

/** What every package linked in one run shares. */
export interface LinkContext {
  /** The organization the storage records belong to. */
  owner: string;
  /** Every `<name>@<version>` the publish step put on npm in this run. */
  published: ReadonlySet<string>;
  /** The npm registry each storage record names, with a trailing slash. */
  registryUrl: string;
  /** Whether this run rehearses against another registry, recording nothing. */
  rehearsal: boolean;
  /** `owner/name`, as the step reports it. */
  repository: string;
  /** The scratch directory tarballs are downloaded to. */
  scratchDirectory: string;
  /** The checksums file each package published here is added to. */
  subjects: string;
}

/** The inputs the link step reads from the environment. */
export interface LinkInputs {
  output: string;
  owner: string;
  repository: string;
  scratchDirectory: string;
}

/** The part of a storage-records answer this step reads. */
export interface StorageRecords {
  storage_records?: { registry_url?: string }[];
}
