import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:net";
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

/**
 * A local port nothing listens on: one the system handed out and was given
 * back.
 */
async function findClosedPort(): Promise<number> {
  const server = createServer();

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });

  if (address === null || typeof address === "string") {
    throw new Error("The test server reported no port");
  }

  return address.port;
}

/**
 * Runs the script `build-database` runs, with the arguments given and the
 * environment given added to this process's own.
 */
function runBuildScript(
  commandLine: string[],
  environment: NodeJS.ProcessEnv = {},
): { status: null | number; stderr: string } {
  const result = spawnSync(process.execPath, [BUILD_SCRIPT, ...commandLine], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    env: { ...process.env, ...environment },
  });

  return { status: result.status, stderr: result.stderr };
}

/**
 * Writes a file holding the tables `persistence export --sqlite` writes from
 * the `caelundas` schema, filled with the seed, and no views.
 */
function writeExportedFile(file: string): void {
  const database = new DatabaseSync(file);

  for (const fileName of ["events-schema.sql", "events-seed.sql"]) {
    database.exec(readFileSync(path.join(DATA_DIRECTORY, fileName), "utf8"));
  }
  database.close();
}

// The bundled file is built by `build-database`, whose export configuration
// exports the ingested tables and applies the views over them. The file it
// writes is read through the `/` route, the way the page reads it.
describe("the bundled events database", () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(path.join(tmpdir(), "caelundas-web-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  it(
    "shows the events of a file built from an export",
    SCRIPT_TEST,
    async () => {
      const exported = path.join(directory, "events-export.sqlite");
      const bundled = path.join(directory, "events.sqlite");
      writeExportedFile(exported);

      const { status } = runBuildScript([
        "--from",
        exported,
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

  it(
    "names the address when the export cannot reach Postgres",
    SCRIPT_TEST,
    async () => {
      const port = await findClosedPort();

      const { status, stderr } = runBuildScript(
        ["--export", "--output", path.join(directory, "events.sqlite")],
        {
          CAELUNDAS_POSTGRES_HOST: "127.0.0.1",
          CAELUNDAS_POSTGRES_PORT: String(port),
        },
      );

      expect(status).toBe(1);
      expect(stderr).toContain(
        `Cannot reach Postgres at 127.0.0.1:${String(port)}`,
      );
    },
  );
});
