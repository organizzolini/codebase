// 🏷️ Types

/** The part of `nx.json` the group is read from. */
export interface NxReleaseConfiguration {
  release: { projects: string[] };
}

/** The fields of a package manifest the release steps read. */
export interface PackageManifest {
  name: string;
  version: string;
}

/** What one call of a parallel task printed, and whether it succeeded. */
export interface ParallelOutcome {
  lines: string[];
  succeeded: boolean;
}

/** The part of `nx graph --file` output each member's directory is read from. */
export interface ProjectGraphFile {
  graph: {
    nodes: Record<string, undefined | { data: { root?: string } }>;
  };
}

/** One project in the Nx release group, and its directory. */
export interface ReleaseGroupMember {
  project: string;
  root: string;
}
