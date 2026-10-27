import { Injectable } from "@nestjs/common";

import { ScannerService } from "../scanner/scanner.service";

import { PYTHON_EXTENSIONS, PYTHON_GRAMMAR } from "./python.constants";

/**
 * Reads the identifiers of a Python file.
 *
 * Comments and strings are skipped; a dictionary key written as a quoted
 * string is kept, because it is a name the author chose.
 */
@Injectable()
export class PythonService {
  // 🏗 Dependency Injection

  constructor(private readonly scannerService: ScannerService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  /** The extensions of the files this tokenizer reads. */
  readonly extensions: readonly string[] = PYTHON_EXTENSIONS;

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Every identifier in a Python file, repeats kept. */
  tokenize(content: string): string[] {
    return this.scannerService.scan(content, PYTHON_GRAMMAR);
  }
}
