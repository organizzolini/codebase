import path from "node:path";

import { Injectable } from "@nestjs/common";

import { CssService } from "../css/css.service";
import { HclService } from "../hcl/hcl.service";
import { JsonService } from "../json/json.service";
import { PythonService } from "../python/python.service";
import { ShellService } from "../shell/shell.service";
import { SqlService } from "../sql/sql.service";
import { TomlService } from "../toml/toml.service";
import { TypescriptService } from "../typescript/typescript.service";
import { YamlService } from "../yaml/yaml.service";

import type { Language, Tokenizer } from "./languages.types";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Chooses the tokenizer for a file by its extension.
 *
 * The registry every language joins: a new language is a module with a
 * tokenizer, injected here and mapped to its extensions, and nothing outside
 * this package changes.
 */
@Injectable()
/* v8 ignore stop */
export class LanguagesService {
  // 🏗 Dependency Injection

  constructor(
    typescriptService: TypescriptService,
    pythonService: PythonService,
    sqlService: SqlService,
    shellService: ShellService,
    cssService: CssService,
    hclService: HclService,
    tomlService: TomlService,
    jsonService: JsonService,
    yamlService: YamlService,
  ) {
    const languages: Language[] = [
      typescriptService,
      pythonService,
      sqlService,
      shellService,
      cssService,
      hclService,
      tomlService,
      jsonService,
      yamlService,
    ];

    for (const language of languages) {
      for (const extension of language.extensions) {
        this.tokenizers.set(extension, (content, filePath) =>
          language.tokenize(content, filePath),
        );
      }
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
