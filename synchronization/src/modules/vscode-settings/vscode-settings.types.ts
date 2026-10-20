// 🏷️ Types

/** A parsed VS Code settings file. */
export type VscodeSettings = Record<string, unknown>;

/** The keys a Machine settings file lacks or holds with a different value. */
export interface VscodeSettingsDrift {
  readonly mismatchedKeys: string[];
  readonly missingKeys: string[];
}
