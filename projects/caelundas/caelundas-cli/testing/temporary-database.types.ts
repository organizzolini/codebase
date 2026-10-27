// 🏷️ Types
import type { DataSource } from "typeorm";

/** A caelundas database file in a temporary directory, with its tables. */
export interface TemporaryDatabase {
  /** Closes the connection, deletes the file, and restores the environment. */
  close: () => Promise<void>;

  /** A connection to the file, with the schema's entities registered. */
  dataSource: DataSource;
}
