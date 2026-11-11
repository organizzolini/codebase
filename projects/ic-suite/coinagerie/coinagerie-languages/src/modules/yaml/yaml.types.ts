// 🏷️ Types

/** Token effect: `key` keeps it, `skip` ignores, `block` opens scalar. */
export type YamlEffect = "block" | "key" | "skip";

/** A matched rule: its effect, captured key, and characters covered. */
export interface YamlHit {
  effect: YamlEffect;
  keys: string[];
  length: number;
}

/** A YAML token kind: sticky pattern and its effect. */
export interface YamlRule {
  effect: YamlEffect;
  pattern: RegExp;
}
