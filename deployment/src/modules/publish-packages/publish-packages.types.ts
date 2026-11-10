// 🏷️ Types

/** What every mirror in one run shares. */
export interface MirrorContext {
  /** The directory each package is packed and renamed in. */
  mirrors: string;
  /** The registry the mirrors are published to. */
  registry: string;
  /** The owner's scope, lowercased, which every mirror is renamed into. */
  scope: string;
}

/** The inputs the publish step reads from the environment. */
export interface PublishInputs {
  githubPackagesRegistry: string;
  githubPackagesToken: string;
  npmToken: string;
  owner: string;
  scratchDirectory: string;
}

/** The part of pnpm's publish summary this step reads. */
export interface PublishSummary {
  publishedPackages?: { name: string; version: string }[];
}
