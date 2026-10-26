import { Injectable } from "@nestjs/common";

import { ScannerService } from "../scanner/scanner.service";

import { SHELL_EXTENSIONS, SHELL_GRAMMAR } from "./shell.constants";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Reads the identifiers of a shell script.
 *
 * Comments, strings, and here-document bodies are skipped. Variable names
 * and commands are kept, and so is a quoted associative array key.
 */
@Injectable()
/* v8 ignore stop */
export class ShellService {
  // 🏗 Dependency Injection

  constructor(private readonly scannerService: ScannerService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  /** The extensions of the files this tokenizer reads. */
  readonly extensions: readonly string[] = SHELL_EXTENSIONS;

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Every identifier in a shell script, repeats kept. */
  tokenize(content: string): string[] {
    return this.scannerService.scan(content, SHELL_GRAMMAR);
  }
}
