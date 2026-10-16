// 🏷️ Types

/** A directory holding a `.env.default`, and what to call it when reporting. */
export interface EnvironmentFileTarget {
  /** The directory, relative to the workspace root. */
  directory: string;
  /** `Root` for the workspace root, otherwise the directory itself. */
  label: string;
}
