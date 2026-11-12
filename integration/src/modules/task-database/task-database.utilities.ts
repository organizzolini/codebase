import path from "node:path";

import { SCHEMA_MARKER } from "./task-database.constants";

/** What follows the last `-v` in a database's name; databases merge only when these match. */
export function schemaOf(database: string): string {
  const name = path.basename(database);
  const schemaAt = name.lastIndexOf(SCHEMA_MARKER);

  return schemaAt === -1 ? name : name.slice(schemaAt + SCHEMA_MARKER.length);
}
