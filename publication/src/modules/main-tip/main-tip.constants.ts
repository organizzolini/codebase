// ♟️ Constants

/** The line that sets `RELEASE_SUPERSEDED` for every later step of the job. */
export const SUPERSEDED_LINE = "RELEASE_SUPERSEDED=true\n";

/** Says why the run is stepping aside. */
export const superseded = (base: string, tip: string): string =>
  `⏭️ main moved from ${base} to ${tip} during this run, whose release the newer run makes instead`;
