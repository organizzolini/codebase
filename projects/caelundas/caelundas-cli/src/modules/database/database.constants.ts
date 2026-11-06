// ♟️ Constants
import path from "node:path";

/**
 * Where the database file is when `CAELUNDAS_SQLITE_DATABASE` names none:
 * `output/database.sqlite` in the `caelundas-cli` project, wherever the
 * command runs from, so the web build always finds what ingestion wrote.
 */
export const DATABASE_DEFAULT_FILE = path.resolve(
  import.meta.dirname,
  "../../../output/database.sqlite",
);

/**
 * The SQL that rewrites the read-model tables caelundas-web queries from the
 * tables a run writes, in the project's `data` folder beside the seed rows.
 */
export const DATABASE_READ_MODEL_FILE = path.resolve(
  import.meta.dirname,
  "../../../data/events-read-model.sql",
);
