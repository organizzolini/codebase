import { Injectable } from "@nestjs/common";

import { ScannerService } from "../scanner/scanner.service";

import { CSS_EXTENSIONS, CSS_GRAMMAR } from "./css.constants";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Reads the identifiers of a CSS stylesheet.
 *
 * Comments, strings, the unquoted body of `url(…)`, and hexadecimal colors are
 * skipped. Selectors, property names, custom properties, and at-rule names
 * are kept as the raw identifiers they are written as.
 */
@Injectable()
/* v8 ignore stop */
export class CssService {
  // 🏗 Dependency Injection

  constructor(private readonly scannerService: ScannerService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  /** The extensions of the files this tokenizer reads. */
  readonly extensions: readonly string[] = CSS_EXTENSIONS;

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Every identifier in a CSS stylesheet, repeats kept. */
  tokenize(content: string): string[] {
    return this.scannerService.scan(content, CSS_GRAMMAR);
  }
}
