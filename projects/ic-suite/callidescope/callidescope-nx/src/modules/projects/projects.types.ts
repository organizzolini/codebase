// 🏷️ Types

/**
 * One Nx project, reduced to what directory resolution needs. Deliberately not shared with
 * `codependix-nx-projects`, which sits in another toolchain.
 */
export interface NxProject {
  readonly name: string;
  /** Workspace-relative root, exactly as the Nx project graph states it. */
  readonly root: string;
  /** The tags `project.json` declares. Empty for a project declaring none. */
  readonly tags: string[];
}

/** A resolved selection, mapped on to the directories a trace takes. */
export interface ResolvedProjectDirectories extends ResolvedProjectSelection {
  /**
   * Workspace-relative roots of the names that resolved, sorted and
   * deduplicated — the form `callidescope --directories` takes.
   */
  readonly directories: string[];
}

/** What a set of Nx project names and tags resolved to, before directories. */
export interface ResolvedProjectSelection {
  /**
   * Every project name the graph knew, sorted — what a caller names back when
   * refusing an unknown one.
   */
  readonly knownNames: string[];
  /**
   * Every tag any project in the workspace carries, sorted and deduplicated —
   * what a caller names back when refusing one nothing carries.
   */
  readonly knownTags: string[];
  /** The projects the selection reached, sorted and deduplicated. */
  readonly projectNames: string[];
  /** Names the project graph does not know, in the order given. Reported, since a silently dropped name covers less than asked. */
  readonly unknownNames: string[];
  /** Tags no project carries, in the order given. Refused like an unknown name, since a tag matching nothing is usually a typo. */
  readonly unmatchedTags: string[];
}
