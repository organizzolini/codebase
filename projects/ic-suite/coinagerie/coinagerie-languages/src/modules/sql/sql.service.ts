import { Injectable } from "@nestjs/common";

import { ScannerService } from "../scanner/scanner.service";

import { SQL_EXTENSIONS, SQL_GRAMMAR } from "./sql.constants";

import type { Language } from "../languages/languages.types";

/**
 * Reads the identifiers of a SQL script.
 *
 * Comments and string literals are skipped, dollar quoted bodies included. A
 * quoted name such as `"order"` is an identifier in SQL, so it is kept.
 */
@Injectable()
export class SqlService implements Language {
  // 🏗 Dependency Injection

  constructor(private readonly scannerService: ScannerService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  /** The extensions of the files this tokenizer reads. */
  readonly extensions: readonly string[] = SQL_EXTENSIONS;

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Every identifier in a SQL script, repeats kept. */
  tokenize(content: string): string[] {
    return this.scannerService.scan(content, SQL_GRAMMAR);
  }
}
