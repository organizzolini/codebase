/** Where this command line lives, for the test that runs it. */
export const REPORT_PROCESS_ENTRY = import.meta.filename;

// Run as a command line, it prints what it was started with and exits with the
// code its first argument names; imported, it does nothing.
if (import.meta.main) {
  const [code = "0", ...rest] = process.argv.slice(2);

  process.stdout.write(
    JSON.stringify({
      args: rest,
      cwd: process.cwd(),
      forceColor: process.env["FORCE_COLOR"],
      greeting: process.env["GREETING"],
      project: process.env["SWC_NODE_PROJECT"],
    }),
  );
  process.stderr.write("diagnostic");
  process.exitCode = Number(code);
}
