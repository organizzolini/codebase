// 🏷️ Types

/** Options accepted by the conformetry sync generator. */
export interface SyncGeneratorOptions {
  /**
   * Path to the conformetry configuration, relative to the workspace root.
   *
   * Falls back to the plugin registration in `nx.json`.
   */
  readonly configuration?: string;
  /** Directory the generator plugin is emitted into. */
  readonly outputPath?: string;
  /** Package name the emitted plugin is addressed by. */
  readonly packageName?: string;
}

/** No-op function carrying `outOfSyncMessage`; `nx g` calls it too. */
export type SyncGeneratorResult = (() => void) & {
  readonly outOfSyncMessage: string;
};
