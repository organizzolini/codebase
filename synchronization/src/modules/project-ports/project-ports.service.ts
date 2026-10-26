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
   * Rewrites a port to another on every line that is about a port.
   *
   * Only the whole number is replaced, so `5003` never matches inside `15003`
   * or `5003.5`.
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
   * Derives a stable default port (1000-9999) from a project name.
   *
   * ```
   * h = 0; for each byte c: h = (h * 31 + c) mod 9000
   * port = h + 1000
   * ```
   *
   * Order matters, and every port is equally likely because 31 shares no
   * factor with 9000, which makes each step a bijection. Different names can
   * still collide, so the caller checks the other projects' ports before
   * adopting one. Bytes are hashed rather than characters, so the result never
   * depends on a locale: `textToPort("lexico-web")` is `7797`.
   */
  textToPort(text: string): number {
    let hash = 0;

    for (const byte of Buffer.from(text, "utf8")) {
      hash = (hash * PORT_HASH_MULTIPLIER + byte) % PORT_HASH_MODULUS;
    }

    return hash + PORT_HASH_OFFSET;
  }
}
