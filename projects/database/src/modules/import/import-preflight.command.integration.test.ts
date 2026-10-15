import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { beforeEach, describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { INTEGRATION_TEST_TIMEOUT_MILLISECONDS } from "../../../testing/fixture-database";

const PASSWORD = "hunter2-secret";
const SETUP_SCRIPT = "scripts/local/software/database.sh";

/** Nothing listens on port 1, so any connection attempt would fail loudly. */
const UNREACHABLE_TARGET_URI = `postgresql://fixture_username:${PASSWORD}@127.0.0.1:1/fixture_development`;

describe("import preflight, before any connection", () => {
  let directory: string;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "fixture-preflight-"));
    return () => {
      fs.rmSync(directory, { force: true, recursive: true });
    };
  });

  /**
   * Puts a `pg_restore` on a PATH of its own that reports `version` and
   * records every argument list it was run with.
   */
  function fakePgRestore(version: string): {
    readonly path: string;
    readonly runs: string;
  } {
    const bin = path.join(directory, "bin");
    const runs = path.join(directory, "runs");
    fs.mkdirSync(bin);
    const script = path.join(bin, "pg_restore");
    fs.writeFileSync(
      script,
      [
        "#!/bin/sh",
        `echo "$@" >> "${runs}"`,
        `if [ "$1" = "--version" ]; then echo "${version}"; exit 0; fi`,
        "exit 1",
        "",
      ].join("\n"),
    );
    fs.chmodSync(script, 0o755);
    return { path: bin, runs };
  }

  async function runImport(
    file: string,
    env: Readonly<Record<string, string>> = {},
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "import",
        "--target-uri",
        UNREACHABLE_TARGET_URI,
        "--table",
        "fixture.widgets",
        "--data",
        "--file",
        file,
      ],
      env,
    });
  }

  it(
    "fails a --file that does not exist, naming it",
    async () => {
      const file = path.join(directory, "missing.dump");

      const result = await runImport(file);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(`${file} does not exist`);
      expect(result.stderr).not.toContain(PASSWORD);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails a --file that is not a dump with pg_restore's own error",
    async () => {
      const file = path.join(directory, "notes.txt");
      fs.writeFileSync(file, "not a dump\n");

      const result = await runImport(file);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("pg_restore failed with exit code 1");
      expect(result.stderr).toContain("does not appear to be a valid archive");
      expect(result.stderr).not.toContain("Nothing was imported");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails a missing pg_restore, naming the setup script",
    async () => {
      const file = path.join(directory, "fixture.dump");
      fs.writeFileSync(file, "a dump");
      const empty = path.join(directory, "empty");
      fs.mkdirSync(empty);

      const result = await runImport(file, { PATH: empty });

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("pg_restore was not found on your PATH");
      expect(result.stderr).toContain(SETUP_SCRIPT);
      expect(result.stderr).not.toContain(PASSWORD);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails a wrong-version pg_restore, asking it nothing but its version",
    async () => {
      const file = path.join(directory, "fixture.dump");
      fs.writeFileSync(file, "a dump");
      const fake = fakePgRestore("pg_restore (PostgreSQL) 16.4");

      const result = await runImport(file, { PATH: fake.path });

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "pg_restore is major version 16, but 18 is required",
      );
      expect(result.stderr).toContain(SETUP_SCRIPT);
      expect(fs.readFileSync(fake.runs, "utf8")).toBe("--version\n");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
