// 🏷️ Types

/**
 * A meander code string (either self-contained formatted or bare hexadecimal digits).
 */
export type Code = string;

/**
 * One Code and the shape it is read at. Its character for `(row, column)`
 * sits at `row * columns + column`.
 */
export interface CodeObject {
  readonly columns: number;
  readonly digits: string;
  readonly repeats: number;
  readonly rows: number;
}
