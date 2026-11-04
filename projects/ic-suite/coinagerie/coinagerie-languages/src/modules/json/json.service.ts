import { Injectable } from "@nestjs/common";

import { ScannerService } from "../scanner/scanner.service";

import { JSON_EXTENSIONS, JSON_GRAMMAR } from "./json.constants";

import type { Language } from "../languages/languages.types";

/**
 * Reads the keys of a JSON document.
 *
 * A key is an identifier and a value is not, so an object contributes the
 * names on its left and an array of strings contributes nothing. Comments are
 * skipped, which also reads JSONC such as a `tsconfig.json`.
 */
@Injectable()
export class JsonService implements Language {
  // 🏗 Dependency Injection

  constructor(private readonly scannerService: ScannerService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  /** The extensions of the files this tokenizer reads. */
  readonly extensions: readonly string[] = JSON_EXTENSIONS;

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Every key in a JSON document, in the order written, repeats kept. */
  tokenize(content: string): string[] {
    return this.scannerService.scan(content, JSON_GRAMMAR);
  }
}
