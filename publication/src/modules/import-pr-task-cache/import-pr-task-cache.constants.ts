// ♟️ Constants

/** A merge group's ref, which names the pull request it tests. */
export const MERGE_GROUP_REF =
  /^refs\/heads\/gh-readonly-queue\/[^\/]+\/pr-(?<number>\d+)-[\da-f]+$/v;

/** Reads a pull request's head commit, head repository, and base repository. */
export const PULL_REQUEST_QUERY =
  '[.head.sha, (.head.repo.full_name // "none"), .base.repo.full_name] | join(" ")';

/** How the work directory's name starts, under `RUNNER_TEMP` or the system's. */
export const WORK_DIRECTORY_PREFIX = "nx-cache-import-";

export const NOT_MERGE_GROUP_MESSAGE =
  "📥 Not a merge group; nothing to import";

/** Reports an import that failed, and why, on one line. */
export const couldNotImportMessage = (reason: string): string =>
  `::warning::Could not import the pull request's Nx cache (${reason.trim().replaceAll(/\s+/gv, " ")}); running cold`;

/** Picks the newest unexpired artifact this repository's run of the head made. */
export const artifactQuery = (headSha: string, repositoryId: string): string =>
  `[.artifacts[] | select(.expired == false and .workflow_run.head_sha == "${headSha}" and .workflow_run.head_repository_id == ${repositoryId})] | .[0].id // empty`;

/** Reports a pull request from another repository, which is not trusted. */
export const untrustedMessage = (
  number: string,
  head: string,
  base: string,
): string =>
  `📥 Pull request #${number} comes from ${head}, not ${base}; not importing`;

/** Reports a pull request run that left no artifact to import. */
export const noArtifactMessage = (name: string): string =>
  `📥 No ${name} artifact from this repository; running cold`;

/** Reports an artifact on its way in. */
export const importingMessage = (name: string, number: string): string =>
  `📥 Importing ${name} from pull request #${number}`;
