// 🏷️ Types

/** One application whose port is derived from its name. */
export interface PortProject {
  /** Path relative to the workspace root. */
  readonly directory: string;
  /** The port the project's name hashes to. */
  readonly expectedPort: number;
  /** The project's Nx name. */
  readonly name: string;
  /** The file that declares the port, and how to read it. */
  readonly source: PortSource;
}

/** Where one kind of application declares the port it serves on. */
export interface PortSource {
  /** Path relative to the project, of the file whose port is the project's current one. */
  readonly filePath: string;
  /** Matches the declaration; its first group is the port. */
  readonly pattern: RegExp;
  /** The project name ending that marks this kind of application. */
  readonly suffix: string;
}
