import { Injectable } from "@nestjs/common";

import {
  PORT_HASH_MODULUS,
  PORT_HASH_MULTIPLIER,
  PORT_HASH_OFFSET,
  PORT_LINE_CONTEXT,
} from "./project-ports.constants";

/**
 * Derives a stable default port from a project name, and rewrites one port to
 * another in text.
 *
 * The derivation is what `scripts/shell/text-to-port.sh` used to be.
 */
@Injectable()
export class ProjectPortsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Rewrites a port on each port line, matching only the whole number so `5003`
   * never matches `15003`.
   */
  replacePort(content: string, from: number, to: number): string {
    const wholeNumber = new RegExp(String.raw`(?<![\w.])${from}(?![\w.])`, "g");

    return content
      .split("\n")
      .map((line) =>
        PORT_LINE_CONTEXT.test(line)
          ? line.replace(wholeNumber, String(to))
          : line,
      )
      .join("\n");
  }

  /**
   * Derives a stable port from 1000 to 9999 by hashing the bytes of `text`.
   * Names can collide, so callers check for clashes.
   */
  textToPort(text: string): number {
    let hash = 0;

    for (const byte of Buffer.from(text, "utf8")) {
      hash = (hash * PORT_HASH_MULTIPLIER + byte) % PORT_HASH_MODULUS;
    }

    return hash + PORT_HASH_OFFSET;
  }
}
