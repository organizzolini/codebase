// 🏷️ Types

/**
 * A token's effect on its line: `key` is kept, `skip` is passed over, `block`
 * opens a block scalar whose lines are not read.
 */
export type YamlEffect = "block" | "key" | "skip";

/** A rule that matched at a position: its effect, the key it captured if it
captured one, and how many characters it covered. */
export interface YamlHit {
  effect: YamlEffect;
  keys: string[];
  length: number;
}

/** One kind of token in a line of YAML: a sticky pattern and its effect. */
export interface YamlRule {
  effect: YamlEffect;
  pattern: RegExp;
}
