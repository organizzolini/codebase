import { mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

// Writes the SQLite file the static build bundles. Until the real export is
// wired in, the file is built from the committed SQL text, so no binary is
// ever committed: `output/` is ignored and rebuilt before every build. The
// files are applied in the order the tests apply them.

const projectRoot = path.resolve(import.meta.dirname, "..");
const outputPath = path.join(projectRoot, "output", "events.sqlite");
// The views come last: the export writes tables only, and the views are
// applied over whatever it wrote.
const sqlFileNames = [
  "events-schema.sql",
  "events-seed.sql",
  "events-views.sql",
];

mkdirSync(path.dirname(outputPath), { recursive: true });
rmSync(outputPath, { force: true });

const database = new DatabaseSync(outputPath);

for (const sqlFileName of sqlFileNames) {
  database.exec(
    readFileSync(path.join(projectRoot, "data", sqlFileName), "utf8"),
  );
}

database.close();
