// 🏷️ Types

/**
 * A meander code string (either self-contained formatted or bare hexadecimal digits).
 */
export type Code = string;

/** A Code and its shape, read row-major. */
export interface CodeObject {
  readonly columns: number;
  readonly digits: string;
  readonly repeats: number;
  readonly rows: number;
}
