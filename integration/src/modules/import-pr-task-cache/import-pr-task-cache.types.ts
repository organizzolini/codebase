// 🏷️ Types

/** Nothing to import, and the line that says why. */
export interface ImportStop {
  kind: "stop";
  line: string;
}

/** The artifact a pull request's run left for its merge group. */
export interface LocatedArtifact {
  /** The artifact's id. */
  artifact: string;
  kind: "located";
  /** The artifact's name, `nx-cache-<scope>-<head sha>`. */
  name: string;
  /** The pull request's number. */
  number: string;
  repository: string;
}

/** A merge group's pull request, from this repository. */
export interface TrustedPullRequest {
  headSha: string;
  kind: "trusted";
  number: string;
  repository: string;
}
