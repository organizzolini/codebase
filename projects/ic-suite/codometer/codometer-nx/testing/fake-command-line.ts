/** Fake `codometer batch` for `node -e`, with no single quotes. */
const FAKE_PROGRAM = String.raw`
const words = process.argv.slice(2);
const directories = words.filter((word) => word.startsWith("/"));
const subject = directories.join(" ");
console.log(JSON.stringify({ directories, logLevel: process.env.LOG_LEVEL ?? null, words }));
if (subject.includes("crash")) {
  console.error("something broke");
  process.exit(2);
}
if (subject.includes("object")) {
  console.log("{}");
} else if (subject.includes("junk")) {
  console.log("[5]");
} else {
  console.log(JSON.stringify(directories
    .filter((directory) => !directory.includes("silent"))
    .map((directory) => ({
      directory,
      ok: !directory.includes("bad"),
      report: directory.includes("bad") ? "limit breached" : "",
    }))));
}
`;

/** Shell command running the fake; `batch` and its flags follow. */
export const FAKE_COMMAND = `node -e '${FAKE_PROGRAM}'`;
