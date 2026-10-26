import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { exportEventsDatabase } from "./export-events-database.ts";

// Writes the SQLite file the static build bundles. `output/` is ignored, so
// no binary is ever committed: the file is rebuilt before every build.
//
// By default it creates the tables from the committed SQL text, the schema
// and the seed the tests load. With `--export` it starts instead from the
// tables `persistence export --sqlite` writes from the Postgres database
// `caelundas-cli` ingested into, and with `--from <file>` from a file that
// export already wrote. Either way the views come last, applied over
// whatever wrote the tables. `--output <file>` writes somewhere other than
// the file the build bundles.

const projectRoot = path.resolve(import.meta.dirname, "..");
const outputDirectory = path.join(projectRoot, "output");
const commandLine = process.argv.slice(2);

/**
 * The value given after `--name` on the command line, if the option was.
 *
 * @throws Error when the option is given with no value after it.
 */
function readOption(name: string): string | undefined {
  const index = commandLine.indexOf(`--${name}`);

  if (index === -1) return undefined;

  const value = commandLine[index + 1];

  if (value === undefined || value.startsWith("--")) {
    throw new Error(`--${name} needs a file path after it`);
  }

  return value;
}

const outputPath = path.resolve(
  projectRoot,
  readOption("output") ?? path.join(outputDirectory, "events.sqlite"),
);
let sourcePath = readOption("from");

if (commandLine.includes("--export")) {
  sourcePath = path.join(path.dirname(outputPath), "events-export.sqlite");
  try {
    await exportEventsDatabase(sourcePath);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// The file is built beside the output and replaces it only once complete, so
// a failed build leaves the last good file in place rather than half of one.
const partialPath = `${outputPath}.partial`;
const sqlFileNames =
  sourcePath === undefined
    ? ["events-schema.sql", "events-seed.sql", "events-views.sql"]
    : ["events-views.sql"];

mkdirSync(path.dirname(outputPath), { recursive: true });
rmSync(partialPath, { force: true });

try {
  if (sourcePath !== undefined) {
    copyFileSync(path.resolve(projectRoot, sourcePath), partialPath);
  }

  const database = new DatabaseSync(partialPath);

  try {
    for (const sqlFileName of sqlFileNames) {
      database.exec(
        readFileSync(path.join(projectRoot, "data", sqlFileName), "utf8"),
      );
    }
    // The browser downloads the file whole, so the space the copied export
    // and the derived tables left behind is reclaimed.
    database.exec("vacuum");
  } finally {
    database.close();
  }
  renameSync(partialPath, outputPath);
} catch (error) {
  rmSync(partialPath, { force: true });
  throw error;
}
