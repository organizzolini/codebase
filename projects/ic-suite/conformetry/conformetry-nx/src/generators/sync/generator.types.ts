// 🏷️ Types

/** Options accepted by the conformetry sync generator. */
export interface SyncGeneratorOptions {
  /** Path to the conformetry configuration, relative to the workspace root. */
  readonly configurationPath?: string;
  /** Directory the generator plugin is emitted into. */
  readonly outputPath?: string;
  /** Package name the emitted plugin is addressed by. */
  readonly packageName?: string;
}

/**
 * What the sync generator returns.
 *
 * Nx's sync runner reads `outOfSyncMessage`, while `nx g` invokes a generator's
 * return value as a callback, so the result is a no-op function carrying it.
 */
export type SyncGeneratorResult = (() => void) & {
  readonly outOfSyncMessage: string;
};
