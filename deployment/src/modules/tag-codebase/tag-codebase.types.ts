// 🏷️ Types

/** What the release command can be asked for. */
export interface TagCodebaseOptions {
  /** Whether to preview the release instead, leaving `main` alone. */
  readonly dryRun?: boolean;
}
