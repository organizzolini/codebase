import path from "node:path";

import { SCHEMA_MARKER } from "./task-database.constants";

/**
 * What follows the last `-v` of a database's name, such as `3.db`, or the
 * whole name when it has none: two databases merge only when these match.
 */
export function schemaOf(database: string): string {
  const name = path.basename(database);
  const schemaAt = name.lastIndexOf(SCHEMA_MARKER);

  return schemaAt === -1 ? name : name.slice(schemaAt + SCHEMA_MARKER.length);
}
