// 🏷️ Types

/**
 * What reading a token does to the scan of its line.
 *
 * A `key` is kept, a `skip` is passed over, and a `block` opens a block
 * scalar, whose indented lines are text and are not read at all.
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
