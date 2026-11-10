import { Injectable } from "@nestjs/common";

import { JsonService } from "../json/json.service";
import { JupyterService } from "../jupyter/jupyter.service";
import { MarkdownService } from "../markdown/markdown.service";
import { PythonService } from "../python/python.service";
import { TextService } from "../text/text.service";
import { TypescriptService } from "../typescript/typescript.service";

import type { ResolveValidatorsArguments } from "./languages.types";
import type { ConformetryLanguageValidator } from "@conformetry/core";

/**
 * Answers which Languages a run needs, and applies the Fallback.
 *
 * The Languages are injected rather than looked up by name, so this is the
 * only place one has to be registered: adding a Language means adding it to
 * `claimingLanguages` below, and its own descriptor says which extensions it
 * claims. There is no second list of extensions to keep in step.
 */
@Injectable()
export class LanguagesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly jsonService: JsonService,
    private readonly jupyterService: JupyterService,
    private readonly markdownService: MarkdownService,
    private readonly pythonService: PythonService,
    private readonly textService: TextService,
    private readonly typescriptService: TypescriptService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Every Language that claims extensions of its own, in report order.
   *
   * The text Language joins only as the Fallback.
   */
  private claimingLanguages(): ConformetryLanguageValidator[] {
    return [
      this.jsonService,
      this.jupyterService,
      this.markdownService,
      this.pythonService,
      this.typescriptService,
    ];
  }

  /**
   * The text Language, widened to also claim the extensions nothing else did.
   *
   * Widening the descriptor routes it like any other Language.
   */
  private widenFallback(
    unclaimedExtensions: string[],
  ): ConformetryLanguageValidator {
    const fallback = this.textService;

    return {
      descriptor: {
        ...fallback.descriptor,
        fileExtensions: [
          ...fallback.descriptor.fileExtensions,
          ...unclaimedExtensions,
        ],
      },
      validateDocument: (document) => fallback.validateDocument(document),
    };
  }

  // 🌎 Public Methods

  /**
   * Resolves a validator for every extension in play.
   *
   * Unclaimed extensions fall back to text, so no template file goes unchecked.
   */
  public resolveValidators(
    args: ResolveValidatorsArguments,
  ): ConformetryLanguageValidator[] {
    const claiming = this.claimingLanguages().filter((language) => {
      return language.descriptor.fileExtensions.some((extension) => {
        return args.extensions.includes(extension);
      });
    });
    const claimed = new Set(
      claiming.flatMap((language) => {
        return [...language.descriptor.fileExtensions];
      }),
    );
    const unclaimed = args.extensions.filter((extension) => {
      return !claimed.has(extension);
    });

    if (unclaimed.length === 0) {
      return claiming;
    }

    return [...claiming, this.widenFallback(unclaimed)];
  }
}
