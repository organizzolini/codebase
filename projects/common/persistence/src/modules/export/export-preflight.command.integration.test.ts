import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { beforeEach, describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { INTEGRATION_TEST_TIMEOUT_MILLISECONDS } from "../../../testing/fixture-database";

const SETUP_SCRIPT = "scripts/local/software/database.sh";

/** Nothing listens on port 1, so any connection attempt would fail loudly. */
const UNREACHABLE_SOURCE_URI =
  "postgresql://fixture_username:hunter2-secret@127.0.0.1:1/fixture_development";

describe("export client-tool preflight", () => {
  let directory: string;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "fixture-preflight-"));
    return () => {
      fs.rmSync(directory, { force: true, recursive: true });
    };
  });

  /**
   * Puts a `pg_dump` on a PATH of its own that reports `version` and records
   * every argument list it was run with; the script creates `dumped` if it
   * is ever run for anything but `--version`.
   */
  function fakePgDump(version: string): {
    readonly dumped: string;
    readonly path: string;
    readonly runs: string;
  } {
    const bin = path.join(directory, "bin");
    const runs = path.join(directory, "runs");
    const dumped = path.join(directory, "dumped");
    fs.mkdirSync(bin);
    const script = path.join(bin, "pg_dump");
    fs.writeFileSync(
      script,
      [
        "#!/bin/sh",
        `echo "$@" >> "${runs}"`,
        `if [ "$1" = "--version" ]; then echo "${version}"; exit 0; fi`,
        `: > "${dumped}"`,
        "exit 1",
        "",
      ].join("\n"),
    );
    fs.chmodSync(script, 0o755);
    return { dumped, path: bin, runs };
  }

  async function runExport(
    searchPath: string,
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "export",
        "--source-uri",
        UNREACHABLE_SOURCE_URI,
        "--table",
        "fixture.widgets",
        "--data",
        "--file",
        path.join(directory, "fixture.dump"),
      ],
      env: { PATH: searchPath },
    });
  }

  it(
    "fails a missing pg_dump, naming the setup script, before any connection",
    async () => {
      const empty = path.join(directory, "empty");
      fs.mkdirSync(empty);

      const result = await runExport(empty);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("pg_dump was not found on your PATH");
      expect(result.stderr).toContain(SETUP_SCRIPT);
      expect(result.stderr).not.toContain("hunter2-secret");
      expect(fs.existsSync(path.join(directory, "fixture.dump"))).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails a wrong-version pg_dump with a different message, asking it nothing but its version",
    async () => {
      const fake = fakePgDump("pg_dump (PostgreSQL) 16.4");

      const result = await runExport(fake.path);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "pg_dump is major version 16, but 18 is required",
      );
      expect(result.stderr).toContain(SETUP_SCRIPT);
      expect(result.stderr).not.toContain("was not found");
      expect(fs.readFileSync(fake.runs, "utf8")).toBe("--version\n");
      expect(fs.existsSync(fake.dumped)).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "goes on to dump once pg_dump is major version 18",
    async () => {
      const fake = fakePgDump("pg_dump (PostgreSQL) 18.6");

      const result = await runExport(fake.path);

      expect(result.exitCode).toBe(1);
      expect(fs.readFileSync(fake.runs, "utf8")).toContain("--format=custom");
      expect(fs.existsSync(fake.dumped)).toBe(true);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
