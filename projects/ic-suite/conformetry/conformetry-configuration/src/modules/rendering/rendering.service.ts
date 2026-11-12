import { Injectable } from "@nestjs/common";
import lodash from "lodash";
import mustache from "mustache";

import {
  MissingSubstitutionError,
  MUSTACHE_RENDER_OPTIONS,
} from "./rendering.constants";

import type { Substitutions } from "./rendering.types";
import type { TemplateSpans } from "mustache";

/**
 * Renders conformetry template placeholders.
 *
 * The single owner of template rendering. Generation and validation both render
 * through it, so validation never flags files the generator produced.
 */
@Injectable()
export class RenderingService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Refuses to render a template asking for a value nobody supplied. */
  private assertEverySubstitutionSupplied(args: {
    subject: string;
    substitutions: Substitutions;
    template: string;
  }): void {
    const placeholders = this.collectInterpolatedNames(args.template).filter(
      (name) => !Object.hasOwn(args.substitutions, name),
    );

    if (placeholders.length > 0) {
      throw new MissingSubstitutionError({
        placeholders,
        subject: args.subject,
      });
    }
  }

  // 🌎 Public Methods

  /**
   * Derives the case variants every template can reference from one name.
   *
   * Explicit inputs with the same key override these.
   */
  public buildNameSubstitutions(name: string): Substitutions {
    const camelCaseName = lodash.camelCase(name);

    return {
      nameCamelCase: camelCaseName,
      nameKebabCase: lodash.kebabCase(name),
      namePascalCase: lodash.upperFirst(camelCaseName),
      nameSnakeCase: lodash.snakeCase(name),
    };
  }

  /**
   * Every placeholder a template interpolates, deduplicated.
   *
   * Mustache's own parser decides what counts, so comments and partials are not placeholders.
   */
  public collectInterpolatedNames(template: string): string[] {
    const names = new Set<string>();
    const walk = (spans: TemplateSpans): void => {
      for (const span of spans) {
        // A span is [type, value, start, end, children?]; indexed rather than
        // destructured because the offsets between are not needed.
        const type = span[0];
        const value = span[1];
        const children = span[4];

        if ((type === "name" || type === "&") && value !== ".") {
          names.add(value);
        }

        if (Array.isArray(children)) {
          walk(children);
        }
      }
    };

    walk(mustache.parse(template));

    return [...names];
  }

  /**
   * Renders template contents with mustache, HTML escaping disabled. Throws
   * `MissingSubstitutionError` for a placeholder with no value; `subject` names the template.
   */
  public renderContent(args: {
    subject?: string;
    substitutions: Substitutions;
    templateContent: string;
  }): string {
    this.assertEverySubstitutionSupplied({
      subject: args.subject ?? "a template file",
      substitutions: args.substitutions,
      template: args.templateContent,
    });

    return mustache.render(
      args.templateContent,
      args.substitutions,
      {},
      MUSTACHE_RENDER_OPTIONS,
    );
  }

  /**
   * Renders a template path with mustache.
   *
   * Uses the same placeholders as contents, so a dunder such as `__init__` is never read as one.
   */
  public renderPath(args: {
    subject?: string;
    substitutions: Substitutions;
    templatePath: string;
  }): string {
    this.assertEverySubstitutionSupplied({
      subject: args.subject ?? args.templatePath,
      substitutions: args.substitutions,
      template: args.templatePath,
    });

    return mustache.render(
      args.templatePath,
      args.substitutions,
      {},
      MUSTACHE_RENDER_OPTIONS,
    );
  }
}
