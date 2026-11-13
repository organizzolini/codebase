import { Injectable } from "@nestjs/common";

import { RenderingService } from "../rendering/rendering.service";
import { createPlaceholderValue } from "../rendering/rendering.utilities";
import { TemplateDiscoveryService } from "../template-discovery/template-discovery.service";

import {
  COMPLETE_MATCH_RATIO,
  MINIMUM_MATCH_RATIO,
} from "./instance-discovery.constants";

import type { Substitutions } from "../rendering/rendering.types";
import type { TemplateDefinition } from "../template-discovery/template-discovery.types";
import type {
  Instance,
  MatchedInstance,
  ResolvedInstances,
  TemplateMatch,
} from "./instance-discovery.types";

/**
 * Decides which template an instance directory was generated from.
 *
 * Nothing declares the answer — an instance is ordinary code with no marker
 * saying where it came from — so the template is inferred from how much of its
 * structure the instance already has.
 */
@Injectable()
export class InstanceDiscoveryMatchingService {
  // 🏗 Dependency Injection

  constructor(
    private readonly templateDiscoveryService: TemplateDiscoveryService,
    private readonly renderingService: RenderingService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Orders matches best-first.
   *
   * Coverage ratio leads, so a large template cannot win a weak partial match.
   * Ties break on count, then name.
   */
  private compareMatches(left: TemplateMatch, right: TemplateMatch): number {
    if (left.matchRatio !== right.matchRatio) {
      return right.matchRatio - left.matchRatio;
    }

    if (left.matchedFileCount !== right.matchedFileCount) {
      return right.matchedFileCount - left.matchedFileCount;
    }

    return left.template.name.localeCompare(right.template.name);
  }

  /**
   * Gives each placeholder the substitutions leave out a random stand-in.
   *
   * Validation infers the stand-in's value from the instance; generation refuses to render one.
   */
  private fillPlaceholders(args: {
    substitutions: Substitutions;
    template: TemplateDefinition;
  }): Pick<TemplateMatch, "placeholderValues" | "substitutions"> {
    const placeholderValues = Object.fromEntries(
      (args.template.placeholderNames ?? [])
        .filter((name) => !Object.hasOwn(args.substitutions, name))
        .map((name) => [name, createPlaceholderValue()]),
    );

    return {
      placeholderValues,
      substitutions: { ...placeholderValues, ...args.substitutions },
    };
  }

  // 🌎 Public Methods

  /**
   * Builds the substitutions an instance's template is rendered with.
   *
   * Caller-supplied values are spread last, so an explicit `type` wins.
   */
  public buildSubstitutions(instance: Instance): Substitutions {
    return {
      ...this.renderingService.buildNameSubstitutions(instance.name),
      name: instance.name,
      ...instance.substitutions,
    };
  }

  /**
   * Resolves every instance to the template, or templates, that explain it.
   *
   * Unexplained or partially tied instances are reported as unmatched, not dropped.
   */
  public matchInstances(args: {
    instances: Instance[];
    templates: TemplateDefinition[];
  }): ResolvedInstances {
    const matched: MatchedInstance[] = [];
    const unmatched: ResolvedInstances["unmatched"] = [];

    for (const instance of args.instances) {
      const substitutions = this.buildSubstitutions(instance);
      const matches = this.matchTemplates({
        instance,
        substitutions,
        templates: args.templates,
      });
      const best = matches[0];

      if (best === undefined) {
        unmatched.push({ instance, reason: "no-match", tiedTemplateNames: [] });
        continue;
      }

      const tied = matches.filter((match) => {
        return (
          match.matchRatio === best.matchRatio &&
          match.matchedFileCount === best.matchedFileCount
        );
      });

      if (tied.length > 1 && best.matchRatio < COMPLETE_MATCH_RATIO) {
        unmatched.push({
          instance,
          reason: "ambiguous",
          tiedTemplateNames: tied.map((match) => match.template.name),
        });
        continue;
      }

      matched.push(
        ...tied.map((match) => {
          return {
            instance,
            matchedFileCount: match.matchedFileCount,
            placeholderValues: match.placeholderValues,
            substitutions: match.substitutions,
            template: match.template,
          };
        }),
      );
    }

    return { matched, unmatched };
  }

  /**
   * Weighs every template sharing a file with the instance, best-first.
   *
   * Public so callers can explain an ambiguous or unmatched outcome.
   */
  public matchTemplates(args: {
    instance: Instance;
    substitutions: Substitutions;
    templates: TemplateDefinition[];
  }): TemplateMatch[] {
    return args.templates
      .map((template) => {
        const filled = this.fillPlaceholders({
          substitutions: args.substitutions,
          template,
        });
        const matchedFileCount =
          this.templateDiscoveryService.countMatchingFiles({
            fileScope: args.instance.fileScope,
            instancePath: args.instance.path,
            substitutions: filled.substitutions,
            template,
          });

        return {
          ...filled,
          matchedFileCount,
          matchRatio: matchedFileCount / template.filePaths.length,
          template,
        };
      })
      .filter((match) => {
        return (
          match.matchedFileCount > 0 && match.matchRatio > MINIMUM_MATCH_RATIO
        );
      })
      .toSorted((left, right) => this.compareMatches(left, right));
  }
}
