/** Fake command line for `node -e`, with no single quotes. */
const FAKE_PROGRAM = String.raw`
const words = process.argv.slice(2);
const subject = [process.cwd(), ...words].join(" ");
console.log(JSON.stringify({
  cwd: process.cwd(),
  logLevel: process.env.LOG_LEVEL ?? null,
  words,
}));
if (words.includes("--verdicts") && !subject.includes("crash")) {
  const directories = words.filter((word) => word.startsWith("/"));
  if (directories.some((directory) => directory.includes("object"))) {
    console.log("{}");
  } else if (directories.some((directory) => directory.includes("junk"))) {
    console.log("[5]");
  } else {
    console.log(JSON.stringify(directories
      .filter((directory) => !directory.includes("silent"))
      .map((directory) => ({ directory, ok: !directory.includes("bad") }))));
  }
}
if (subject.includes("crash")) {
  console.error("something broke");
  process.exit(2);
}
if (subject.includes("bad")) {
  console.error("limit breached");
  process.exit(1);
}
`;

/** Shell command running the fake; `measure` and its flags follow. */
export const FAKE_COMMAND = `node -e '${FAKE_PROGRAM}'`;
