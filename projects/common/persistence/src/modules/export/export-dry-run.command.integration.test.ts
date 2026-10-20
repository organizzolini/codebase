import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { INTEGRATION_TEST_TIMEOUT_MILLISECONDS } from "../../../testing/fixture-persistence";

const PASSWORD = "hunter2-secret";

/** Nothing listens on port 1, so any connection attempt would fail loudly. */
const UNREACHABLE_SOURCE_URI = `postgresql://fixture_username:${PASSWORD}@127.0.0.1:1/fixture_development`;

describe("export --dry-run", () => {
  let directory: string;
  let file: string;
  let runs: string;
  let searchPath: string;

  /** `export --dry-run` of `fixture.widgets` to `file`, plus `extra`. */
  async function runDryRun(
    ...extra: readonly string[]
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "export",
        "--source-uri",
        UNREACHABLE_SOURCE_URI,
        "--table",
        "fixture.widgets",
        "--file",
        file,
        "--dry-run",
        ...extra,
      ],
      env: { PATH: searchPath },
    });
  }

  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "export-dry-run-"));
    file = path.join(directory, "fixture.dump");
    runs = path.join(directory, "runs");
    const bin = path.join(directory, "bin");
    fs.mkdirSync(bin);
    // Records each argument list, then hands over to the real pg_dump.
    const script = path.join(bin, "pg_dump");
    fs.writeFileSync(
      script,
      [
        "#!/bin/sh",
        `echo "$@" >> "${runs}"`,
        `PATH="${process.env["PATH"] ?? ""}"`,
        `exec pg_dump "$@"`,
        "",
      ].join("\n"),
    );
    fs.chmodSync(script, 0o755);
    searchPath = `${bin}${path.delimiter}${process.env["PATH"] ?? ""}`;
  });

  afterAll(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it(
    "prints the plan for an unreachable source, running only pg_dump --version",
    async () => {
      const result = await runDryRun("--data");

      const output = result.logs.join("\n");

      expect(result.exitCode).toBe(0);
      expect(output).toContain('database "fixture_development" on 127.0.0.1');
      expect(output).toContain("Planning to export data of fixture.widgets");
      expect(output).toContain(`Planning to create ${file}`);
      expect(`${output}${result.stderr}`).not.toContain(PASSWORD);
      expect(fs.readFileSync(runs, "utf8")).toBe("--version\n");
      expect(fs.readdirSync(directory).toSorted()).toStrictEqual([
        "bin",
        "runs",
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "leaves an existing file as it was with --overwrite",
    async () => {
      fs.writeFileSync(file, "an earlier dump");
      const before = fs.statSync(file).mtimeMs;

      const result = await runDryRun("--ddl", "--overwrite");

      expect(result.exitCode).toBe(0);
      expect(result.logs.join("\n")).toContain(`Planning to overwrite ${file}`);
      expect(fs.readFileSync(file, "utf8")).toBe("an earlier dump");
      expect(fs.statSync(file).mtimeMs).toBe(before);
      expect(fs.readdirSync(directory).toSorted()).toStrictEqual([
        "bin",
        "fixture.dump",
        "runs",
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "still refuses an existing file without --overwrite",
    async () => {
      fs.writeFileSync(file, "an earlier dump");

      const result = await runDryRun("--data");

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(`${file} already exists`);
      expect(result.stderr).not.toContain(PASSWORD);
      expect(fs.readFileSync(file, "utf8")).toBe("an earlier dump");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
