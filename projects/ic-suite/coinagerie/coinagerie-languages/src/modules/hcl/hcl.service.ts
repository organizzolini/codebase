import { Injectable } from "@nestjs/common";

import { ScannerService } from "../scanner/scanner.service";

import { HCL_EXTENSIONS, HCL_GRAMMAR } from "./hcl.constants";

import type { Language } from "../languages/languages.types";

/**
 * Reads the identifiers of an HCL file, such as Terraform configuration.
 *
 * Comments, strings, and here-document bodies are skipped. Attribute names,
 * block types, and function names are kept, and so are an object key written
 * as a quoted string and the labels of a block header.
 */
@Injectable()
export class HclService implements Language {
  // 🏗 Dependency Injection

  constructor(private readonly scannerService: ScannerService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  /** The extensions of the files this tokenizer reads. */
  readonly extensions: readonly string[] = HCL_EXTENSIONS;

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Every identifier in an HCL file, repeats kept. */
  tokenize(content: string): string[] {
    return this.scannerService.scan(content, HCL_GRAMMAR);
  }
}
