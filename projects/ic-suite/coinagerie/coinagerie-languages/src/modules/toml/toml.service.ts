import { Injectable } from "@nestjs/common";

import { ScannerService } from "../scanner/scanner.service";

import { TOML_EXTENSIONS, TOML_GRAMMAR } from "./toml.constants";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Reads the identifiers of a TOML document.
 *
 * Comments and string values are skipped. Bare keys, table names, and quoted
 * keys, including those in a dotted path or a table header, are kept.
 */
@Injectable()
/* v8 ignore stop */
export class TomlService {
  // 🏗 Dependency Injection

  constructor(private readonly scannerService: ScannerService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  /** The extensions of the files this tokenizer reads. */
  readonly extensions: readonly string[] = TOML_EXTENSIONS;

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Every identifier in a TOML document, repeats kept. */
  tokenize(content: string): string[] {
    return this.scannerService.scan(content, TOML_GRAMMAR);
  }
}
