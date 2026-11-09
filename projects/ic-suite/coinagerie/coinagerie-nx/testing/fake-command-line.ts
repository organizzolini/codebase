/**
 * Fake command line for `node -e`, written without single quotes so the shell
 * carries it as one argument. Directory names select failure modes.
 */
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

/** The shell command that runs the fake command line; `batch` and directories follow it. */
export const FAKE_COMMAND = `node -e '${FAKE_PROGRAM}'`;
