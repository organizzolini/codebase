import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

// Writes the SQLite file the static build bundles. `output/` is ignored, so
// no binary is ever committed.
//
// `caelundas-cli` owns the database and leaves it web-ready: every run ends
// by rewriting the read model this app queries. With `--ingested` the build
// copies that file. By default, where nothing has been ingested, it builds one
// from the entities library's migration and the CLI's committed seed rows, the way the tests do.

const projectRoot = path.resolve(import.meta.dirname, "..");
const cliRoot = path.join(projectRoot, "../caelundas-cli");
const ingested = path.join(cliRoot, "output/database.sqlite");
const output = path.join(projectRoot, "output/events.sqlite");
const partial = `${output}.partial`;
const migrations = path.join(
  projectRoot,
  "../caelundas-entities/src/modules/database/migrations",
);

mkdirSync(path.dirname(output), { recursive: true });
rmSync(partial, { force: true });

try {
  if (process.argv.includes("--ingested")) {
    if (!existsSync(ingested)) {
      throw new Error(
        `${ingested} does not exist: run \`nx run caelundas-cli:start\` to ingest events, or build from the seed`,
      );
    }
    copyFileSync(ingested, partial);
  } else {
    const database = new DatabaseSync(partial);

    // The migration records its view in TypeORM's `typeorm_metadata` table,
    // which TypeORM creates and a bare database lacks.
    database.exec(
      'create table "typeorm_metadata" ("type" varchar not null, "database" varchar, "schema" varchar, "table" varchar, "name" varchar, "value" text)',
    );

    for (const file of [
      ...readdirSync(migrations)
        .filter((name) => name.endsWith("-up.sql"))
        .toSorted()
        .map((name) => path.join(migrations, name)),
      path.join(cliRoot, "data/events-seed.sql"),
      path.join(cliRoot, "data/night-sky-seed.sql"),
      path.join(cliRoot, "data/events-read-model.sql"),
    ]) {
      database.exec(readFileSync(file, "utf8"));
    }
    database.close();
  }
  renameSync(partial, output);
} catch (error) {
  rmSync(partial, { force: true });
  throw error;
}
