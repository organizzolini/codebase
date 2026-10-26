import { Injectable } from "@nestjs/common";

import { YAML_EXTENSIONS, YAML_RULES, YAML_UNMATCHED } from "./yaml.constants";

import type { YamlHit } from "./yaml.types";

/**
 * Reads the keys of a YAML document.
 *
 * A key is an identifier and a value is not, so a mapping contributes the
 * names on its left and a sequence of plain values contributes nothing.
 * Block scalar bodies are skipped, because the text of a `run: |` script is
 * not a name. The scan is one line at a time and judges nothing about the
 * document as a whole, so a half-written file still yields every key it has.
 */
@Injectable()
export class YamlService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  /** The extensions of the files this tokenizer reads. */
  readonly extensions: readonly string[] = YAML_EXTENSIONS;

  // 🔏 Private Methods

  /** How many columns a line is indented. */
  private indentOf(line: string): number {
    return line.length - line.trimStart().length;
  }

  /** Whether a line is text inside the block scalar owned at `owner`. */
  private isInsideBlock(line: string, owner: number): boolean {
    return line.trim().length === 0 || this.indentOf(line) > owner;
  }

  /**
   * The first rule that matches at `index`, or a one-character skip when none
   * does.
   *
   * The rules cover every character a line can hold, so the skip is only a
   * guarantee that a scan always moves forward.
   */
  private matchRule(line: string, index: number): YamlHit {
    let hit: YamlHit = YAML_UNMATCHED;

    for (const { effect, pattern } of YAML_RULES) {
      pattern.lastIndex = index;
      const match = pattern.exec(line);

      if (match !== null) {
        hit = { effect, keys: match.slice(1, 2), length: match[0].length };
        break;
      }
    }

    return hit;
  }

  /**
   * Adds a line's keys to `keys`, and reports the column that owns a block
   * scalar the line opens, if it opens one.
   */
  private readLine(line: string, keys: string[]): number | undefined {
    let index = 0;
    let owner = this.indentOf(line);

    while (index < line.length) {
      const hit = this.matchRule(line, index);

      if (hit.effect === "block") {
        return owner;
      }

      if (hit.effect === "key") {
        keys.push(...hit.keys);
        owner = index;
      }

      index += Math.max(hit.length, 1);
    }

    return undefined;
  }

  // 🌎 Public Methods

  /** Every key in a YAML document, in the order written, repeats kept. */
  tokenize(content: string): string[] {
    const keys: string[] = [];
    let blockOwner: number | undefined;

    for (const line of content.split(/\r\n|\r|\n/)) {
      if (blockOwner === undefined || !this.isInsideBlock(line, blockOwner)) {
        blockOwner = this.readLine(line, keys);
      }
    }

    return keys.filter((key) => key.length > 0);
  }
}
