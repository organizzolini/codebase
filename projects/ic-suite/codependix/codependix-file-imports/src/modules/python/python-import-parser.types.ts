// 🏷️ Types

/**
 * One module a Python import statement names. Names a `from` statement binds are
 * dropped, as a file graph never uses them.
 */
export interface PythonImportSpecifier {
  /**
   * Leading dots on a `from` statement's module: `0` for absolute, `1` for
   * `from . import y`, `2` for `from .. import y`.
   */
  readonly level: number;
  /**
   * The dotted module path, with dots left in (`"src.grammars"`), or an
   * empty string for a bare relative import (`from . import y`).
   */
  readonly modulePath: string;
}
