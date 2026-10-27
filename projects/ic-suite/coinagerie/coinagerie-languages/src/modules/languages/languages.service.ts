import path from "node:path";

import { Injectable } from "@nestjs/common";

import { TYPESCRIPT_SCRIPT_KINDS } from "../typescript/typescript.constants";
import { TypescriptService } from "../typescript/typescript.service";

import type { Tokenizer } from "./languages.types";

/**
 * Chooses the tokenizer for a file by its extension.
 *
 * The registry every language joins: a new language is a module with a
 * tokenizer, injected here and mapped to its extensions, and nothing outside
 * this package changes.
 */
@Injectable()
export class LanguagesService {
  // 🏗 Dependency Injection

  constructor(private readonly typescriptService: TypescriptService) {
    const typescriptTokenizer: Tokenizer = (content, filePath) =>
      this.typescriptService.tokenize(content, filePath);

    for (const extension of TYPESCRIPT_SCRIPT_KINDS.keys()) {
      this.tokenizers.set(extension, typescriptTokenizer);
    }
  }

  // 🔐 Private Fields

  /** Each lowercase extension, with its leading dot, to its tokenizer. */
  private readonly tokenizers = new Map<string, Tokenizer>();

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * The tokenizer for a file, or `undefined` when no language claims it.
   *
   * A file without one still contributes the words of its path; only its
   * content goes unread.
   */
  tokenizerFor(filePath: string): Tokenizer | undefined {
    return this.tokenizers.get(path.extname(filePath).toLowerCase());
  }
}
