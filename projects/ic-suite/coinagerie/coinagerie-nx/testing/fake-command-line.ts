/**
 * The program a fake command line runs, as the source of a `node -e` script.
 *
 * It stands in for the coinagerie command line: it judges every directory named
 * after `batch` and prints one verdict each, as the real command does. A
 * directory whose name holds `bad` fails, one holding `silent` gets no verdict,
 * one holding `crash` makes the whole process print noise and no JSON, one
 * holding `object` prints JSON that is no list, and one holding `junk` prints a
 * list with something in it that is no verdict.
 * Written without a single quote so the shell can carry it as one argument.
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
