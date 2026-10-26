import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { openTestEventsDatabase } from "../../../testing/events-database";
import { renderRoute } from "../../../testing/render-route";

const PROJECT_ROOT = path.join(import.meta.dirname, "../../..");
const DATA_DIRECTORY = path.join(PROJECT_ROOT, "data");
// Each test starts a Node process, which a slow continuous integration
// runner needs well past the default time for.
const SCRIPT_TEST = { timeout: 30_000 };
const BUILD_SCRIPT = path.join(
  PROJECT_ROOT,
  "scripts",
  "build-events-database.ts",
);

/** Runs the script `build-database` runs, with the arguments given. */
function runBuildScript(commandLine: string[]): { status: null | number } {
  const result = spawnSync(process.execPath, [BUILD_SCRIPT, ...commandLine], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
  });

  return { status: result.status };
}

/**
 * Writes a file holding the tables, filled with the seed, and no views.
 */
function writeSourceFile(file: string): void {
  const database = new DatabaseSync(file);

  for (const fileName of ["events-schema.sql", "events-seed.sql"]) {
    database.exec(readFileSync(path.join(DATA_DIRECTORY, fileName), "utf8"));
  }
  database.close();
}

// The bundled file is built by `build-database`, which applies the views over
// a file holding the tables. The file it writes is read through the `/`
// route, the way the page reads it.
describe("the bundled events database", () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(path.join(tmpdir(), "caelundas-web-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  it(
    "shows the events of a file built from a source file",
    SCRIPT_TEST,
    async () => {
      const source = path.join(directory, "events-source.sqlite");
      const bundled = path.join(directory, "events.sqlite");
      writeSourceFile(source);

      const { status } = runBuildScript([
        "--from",
        source,
        "--output",
        bundled,
      ]);

      expect(status).toBe(0);

      await renderRoute("/?date=2026-03-04", {
        eventsDatabase: openTestEventsDatabase(bundled),
      });

      await expect(
        screen.findByText("Mars Conjunct Venus"),
      ).resolves.toBeDefined();
    },
  );
});
