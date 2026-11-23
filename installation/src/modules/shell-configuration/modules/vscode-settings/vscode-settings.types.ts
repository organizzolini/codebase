// 🏷️ Types

/** A parsed VS Code settings file. */
export type VscodeSettings = Record<string, unknown>;

/** Keys a Machine settings file lacks or holds differently. */
export interface VscodeSettingsDrift {
  readonly mismatchedKeys: string[];
  readonly missingKeys: string[];
}
