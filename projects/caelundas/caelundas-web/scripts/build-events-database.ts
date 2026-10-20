import { copyFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { exportEventsDatabase } from "./export-events-database.ts";

// Writes the SQLite file the static build bundles. `output/` is ignored, so
// no binary is ever committed: the file is rebuilt before every build.
//
// By default it creates the tables from the committed SQL text, the schema
// and the seed the tests load. With `--export` it starts instead from the
// tables `database export --sqlite` writes from the Postgres database
// `caelundas-cli` ingested into, and with `--from <file>` from a file that
// export already wrote. Either way the views come last, applied over
// whatever wrote the tables. `--output <file>` writes somewhere other than
// the file the build bundles.

const projectRoot = path.resolve(import.meta.dirname, "..");
const outputDirectory = path.join(projectRoot, "output");
const commandLine = process.argv.slice(2);

/** The value given after `--name` on the command line, if any. */
function readOption(name: string): string | undefined {
  const index = commandLine.indexOf(`--${name}`);

  return index === -1 ? undefined : commandLine[index + 1];
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

mkdirSync(path.dirname(outputPath), { recursive: true });
rmSync(outputPath, { force: true });

if (sourcePath !== undefined) {
  copyFileSync(path.resolve(projectRoot, sourcePath), outputPath);
}

const sqlFileNames =
  sourcePath === undefined
    ? ["events-schema.sql", "events-seed.sql", "events-views.sql"]
    : ["events-views.sql"];
const database = new DatabaseSync(outputPath);

for (const sqlFileName of sqlFileNames) {
  database.exec(
    readFileSync(path.join(projectRoot, "data", sqlFileName), "utf8"),
  );
}

// The browser downloads the file whole, so the space the copied export and
// the derived tables left behind is reclaimed.
database.exec("vacuum");
database.close();
