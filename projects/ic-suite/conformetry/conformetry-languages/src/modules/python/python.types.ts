// 🏷️ Types

/** One bridge error in snake_case, `unknown` until narrowed. */
export type PythonBridgeError = Readonly<Record<string, unknown>>;

/** The bridge's response envelope. */
export interface PythonBridgeResponse {
  readonly differences: PythonBridgeError[];
  /**
   * Template requirements the Python side weighed the instance against.
   * Snake_case and `unknown`, as with the differences above.
   */
  readonly total_weight?: unknown;
}

/** Arguments for one bridge invocation. */
export interface RunPythonBridgeArguments {
  readonly filename: string;
  readonly instance: string;
  /** Template source, already rendered on the TypeScript side. */
  readonly template: string;
}
