import { Injectable } from "@nestjs/common";

import { ScannerService } from "../scanner/scanner.service";

import { JSON_EXTENSIONS, JSON_GRAMMAR } from "./json.constants";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Reads the keys of a JSON document.
 *
 * A key is an identifier and a value is not, so an object contributes the
 * names on its left and an array of strings contributes nothing. Comments are
 * skipped, which also reads JSONC such as a `tsconfig.json`.
 */
@Injectable()
/* v8 ignore stop */
export class JsonService {
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
