// The database file is a build artifact, absent until `build-database` runs,
// so it is found by a glob rather than imported: the build still emits it as
// a fingerprinted file, and nothing reads a missing file as a broken import.
const DATABASE_URLS = import.meta.glob<string>(
  "../../../output/events.sqlite",
  {
    eager: true,
    import: "default",
    query: "?url",
  },
);

export const DATABASE_URL = Object.values(DATABASE_URLS).at(0) ?? "";
