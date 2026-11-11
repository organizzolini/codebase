/** Fake command line for `node -e`, with no single quotes. */
const FAKE_PROGRAM = String.raw`
const directories = process.argv.slice(2).filter((word) => !word.startsWith("--"));
const write = process.argv.includes("--write");
if (directories.some((directory) => directory.includes("crash"))) {
  console.error("something broke");
  process.exit(2);
}
if (directories.some((directory) => directory.includes("object"))) {
  console.log("{}");
  process.exit(0);
}
if (directories.some((directory) => directory.includes("junk"))) {
  console.log("[5]");
  process.exit(0);
}
const verdicts = directories
  .filter((directory) => !directory.includes("silent"))
  .map((directory) => ({
    directory,
    ok: !directory.includes("bad"),
    report: directory.includes("bad") ? "missing: argv" : write ? "wrote" : "",
  }));
console.log(JSON.stringify(verdicts));
`;

/** Shell command running the fake; `batch` and directories follow. */
export const FAKE_COMMAND = `node -e '${FAKE_PROGRAM}'`;
