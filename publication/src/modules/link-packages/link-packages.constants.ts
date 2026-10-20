// ♟️ Constants

/** The checksums file `actions/attest` reads, beneath `RUNNER_TEMP`. */
export const ATTESTATION_SUBJECTS_FILE = "attestation-subjects.txt";

/** The step output that tells the attestation step to run. */
export const ATTEST_OUTPUT_LINE = "attest=true\n";

/**
 * How the tarball download retries, because npm can trail a publish by
 * minutes: in v2.34.0 npm served each new tarball about 4 minutes after pnpm
 * reported it published, and answered 404 until then. Up to 8 minutes in all.
 */
export const TARBALL_DOWNLOAD_FLAGS = [
  "--silent",
  "--show-error",
  "--fail",
  "--location",
  "--retry",
  "48",
  "--retry-all-errors",
  "--retry-delay",
  "10",
  "--retry-max-time",
  "480",
];

/** Reports a package whose storage record exists. */
export const alreadyLinkedMessage = (specifier: string): string =>
  `🔗 ${specifier} is already linked`;

/** Reports a package a rehearsal leaves off the Linked artifacts page. */
export const rehearsalMessage = (specifier: string): string =>
  `🧪 ${specifier} is not recorded on GitHub in a rehearsal`;

/** Reports a package about to be linked. */
export const linkingMessage = (specifier: string, repository: string): string =>
  `🔗 Linking ${specifier} to ${repository}`;
