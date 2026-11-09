import {
  ALL_TEMPLATES_SELECTION,
  ConfigurationService,
} from "@conformetry/configuration";
import { ReportingService } from "@conformetry/output";
import { ValidationService } from "@conformetry/validation";
import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import {
  CONFIGURATION_FLAG_SURFACE,
  unknownTemplateError,
} from "../../conformetry-cli.constants.js";

import type { ValidateCommandOptions } from "./validate.types.js";
import type {
  ConformetryConfiguration,
  ConformetryGeneratorDefinition,
  ConformetryInstanceGroup,
  Instance,
} from "@conformetry/configuration";
import type { RunValidationResult } from "@conformetry/validation";

/**
 * Validates instances against their conformetry templates.
 *
 * `--instances` and `--templates` each remove candidates from one side, so a run covers their intersection.
 *
 * `--templates` is asked for only at a terminal; otherwise every template runs.
 */
@Command({
  description:
    "Measure instances against their templates and report every difference",
  name: "validate",
})
@Injectable()
export class ValidateCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly reportingService: ReportingService,
    private readonly validationService: ValidationService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(ValidateCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Names each failed instance and the reason the run failed.
   *
   * Findings can print for passing instances, so the message names the failures.
   */
  private describeFailure(result: RunValidationResult): string {
    const failed = result.scores.filter((score) => !score.ok);
    const reasons = [
      ...failed.map((score) => {
        return `${score.instancePath} scored ${this.reportingService.formatPercentage(score.score)} against ${score.templateName} (threshold ${this.reportingService.formatPercentage(score.threshold)})`;
      }),
      ...(result.unmatched.length === 0
        ? []
        : [
            `${String(result.unmatched.length)} instance(s) matched no template`,
          ]),
    ];

    return `Validation failed: ${reasons.join("; ")}.`;
  }

  /**
   * Expands each glob group into instances, or the `--instances` override.
   *
   * Groups keep each glob's substitutions separate, since `type` can differ per glob.
   */
  private findInstances(args: {
    groups: ConformetryInstanceGroup[];
    workingDirectory: string;
  }): Instance[] {
    // Tag-scoped groups are dropped rather than expanded: their globs are read
    // inside each project their tags select, and this host resolves no tags.
    return this.configurationService
      .readWorkspaceGroups(args.groups)
      .flatMap((group) => {
        return this.configurationService.findInstances({
          ...(group.exclude === undefined ? {} : { exclude: group.exclude }),
          // A group may name only labels, which this host has nothing to match
          // them against — it locates instances by glob alone.
          patterns: group.patterns ?? [],
          ...(group.substitutions === undefined
            ? {}
            : { substitutions: group.substitutions }),
          ...(group.threshold === undefined
            ? {}
            : { threshold: group.threshold }),
          workingDirectory: args.workingDirectory,
        });
      });
  }

  /**
   * Offers a picker, or declines where nobody can answer.
   *
   * Declining selects nothing rather than refusing, so the whole workspace still validates.
   */
  private async promptForTemplateNames(
    configuration: ConformetryConfiguration,
  ): Promise<string[] | undefined> {
    if (!this.configurationService.isAtTerminal()) {
      return undefined;
    }

    return this.configurationService.promptForTemplates(configuration);
  }

  /**
   * Reports a narrowing that matched nothing, rather than a clean run.
   *
   * An empty report would look like a pass.
   */
  private reportEmptySelection(
    selectedTemplates: ConformetryGeneratorDefinition[],
  ): void {
    const templateNames = selectedTemplates.map((template) => template.name);
    // A template whose every group is tag-scoped was never searched for at
    // all, which is a different answer from having been searched for and not
    // found — and the reader's next move is a different command, not an edit.
    const tagScopedNames = selectedTemplates
      .filter((template) => {
        return (
          template.instances.length > 0 &&
          this.configurationService.readWorkspaceGroups(template.instances)
            .length === 0
        );
      })
      .map((template) => template.name);

    process.stdout.write(
      [
        `No instances belong to ${templateNames.join(", ")}, so nothing was checked.`,
        ...(tagScopedNames.length === 0
          ? []
          : [
              `${tagScopedNames.join(", ")} locates instances by project tag, which this host cannot resolve. Run validation through @conformetry/nx, or pass --instances with the paths to check.`,
            ]),
        "",
      ].join("\n"),
    );
    this.logger.info("🫙 Validated nothing", undefined, {
      tagScopedNames,
      templateNames,
    });
  }

  /**
   * Writes the report to stdout and fails the run when anything fell short.
   *
   * The report is the product, so it skips the logger.
   */
  private reportResult(args: {
    result: RunValidationResult;
    workingDirectory: string;
  }): void {
    process.stdout.write(
      `${this.reportingService.formatReport({
        fileResults: args.result.fileResults,
        scores: args.result.scores,
        workingDirectory: args.workingDirectory,
      })}\n`,
    );

    const failedCount = args.result.scores.filter((score) => !score.ok).length;
    const unmatchedCount = args.result.unmatched.length;

    this.logger.info("👔 Validated conformetry instances", undefined, {
      count: args.result.checkedPaths.length,
      failedCount,
      unmatchedCount,
    });

    if (!args.result.ok) {
      process.exitCode = 1;
      this.logger.warn("⚠️ Rejected non-conforming instances", undefined, {
        failedCount,
        unmatchedCount,
      });
      throw new Error(this.describeFailure(args.result));
    }
  }

  /**
   * Intersects the globbed paths with the selected templates' instances.
   *
   * Each flag only removes candidates from its own side, so neither wins.
   */
  private selectInstances(args: {
    configuration: ConformetryConfiguration;
    instanceGlobs: string[] | undefined;
    selectedTemplates: ConformetryGeneratorDefinition[] | undefined;
    workingDirectory: string;
  }): Instance[] {
    const templateInstances = this.findInstances({
      groups: (args.selectedTemplates ?? args.configuration).flatMap(
        (generator) => generator.instances,
      ),
      workingDirectory: args.workingDirectory,
    });

    if (args.instanceGlobs === undefined) {
      return templateInstances;
    }

    const globbedInstances = this.findInstances({
      groups: [{ patterns: args.instanceGlobs }],
      workingDirectory: args.workingDirectory,
    });

    if (args.selectedTemplates === undefined) {
      return globbedInstances;
    }

    const selectedPaths = new Set(
      templateInstances.map((instance) => instance.path),
    );

    return globbedInstances.filter((instance) => {
      return selectedPaths.has(instance.path);
    });
  }

  /**
   * Narrows the run to the selected templates, or leaves it whole.
   *
   * `undefined` means no narrowing, not an empty selection.
   */
  private async selectTemplates(args: {
    configuration: ConformetryConfiguration;
    templateNames: string[] | undefined;
  }): Promise<ConformetryGeneratorDefinition[] | undefined> {
    const selectedNames =
      args.templateNames ??
      (await this.promptForTemplateNames(args.configuration));

    if (
      selectedNames === undefined ||
      selectedNames.includes(ALL_TEMPLATES_SELECTION)
    ) {
      return undefined;
    }

    return selectedNames.map((templateName) => {
      const definition = args.configuration.find((generator) => {
        return generator.name === templateName;
      });

      if (definition === undefined) {
        this.logger.error("🚫 Rejected an unknown template", undefined, {
          template: templateName,
        });
        throw unknownTemplateError({
          availableTemplateNames: args.configuration.map((generator) => {
            return generator.name;
          }),
          templateName,
        });
      }

      return definition;
    });
  }

  // 🌎 Public Methods

  /** Parses the required configuration path. */
  @Option({
    description: "Path to the conformetry configuration file",
    flags: "--config <path>",
    required: true,
  })
  public parseConfig(value: string | undefined): string {
    return this.configurationService.requireConfigurationPath(
      value,
      CONFIGURATION_FLAG_SURFACE,
    );
  }

  /** Parses the optional instance glob override. */
  @Option({
    description:
      "Comma-separated glob patterns to validate, overriding the configuration",
    flags: "--instances [globs]",
  })
  public parseInstances(value: string | undefined): string[] | undefined {
    return this.configurationService.parseCommaDelimitedOption(value);
  }

  /** Parses the optional language filter. */
  @Option({
    description: "Comma-separated language names to run",
    flags: "--languages [languages]",
  })
  public parseLanguages(value: string | undefined): string[] | undefined {
    return this.configurationService.parseCommaDelimitedOption(value);
  }

  /**
   * Parses the optional template filter.
   *
   * Comma-delimited like its `--instances` and `--languages` siblings, so all
   * three read the same way on a command line.
   */
  @Option({
    description: `Comma-separated template names to validate, or "${ALL_TEMPLATES_SELECTION}" for every one`,
    flags: "--templates [names]",
  })
  public parseTemplates(value: string | undefined): string[] | undefined {
    return this.configurationService.parseCommaDelimitedOption(value);
  }

  /** Parses the optional run-level conformance threshold. */
  @Option({
    description:
      "Lowest conformance score an instance may have, from 0 to 1. Overridden by a generator's own threshold and by an instance group's",
    flags: "--threshold [ratio]",
  })
  public parseThreshold(value: string | undefined): number | undefined {
    return this.configurationService.parseThresholdOption(value);
  }

  /** Runs validation and reports every difference found. */
  public async run(
    _passedParameters: string[],
    options: ValidateCommandOptions,
  ): Promise<void> {
    this.logger.debug("🔍 Validating conformetry instances", undefined, {
      instanceFilter: options.instances,
    });

    const workingDirectory = process.cwd();
    const configuration =
      await this.configurationService.loadConformetryConfiguration(
        options.config,
      );
    const selectedTemplates = await this.selectTemplates({
      configuration,
      templateNames: options.templates,
    });
    const instances = this.selectInstances({
      configuration,
      instanceGlobs: options.instances,
      selectedTemplates,
      workingDirectory,
    });

    if (selectedTemplates !== undefined && instances.length === 0) {
      this.reportEmptySelection(selectedTemplates);

      return;
    }

    const result = this.validationService.validate({
      instances,
      ...(options.threshold === undefined
        ? {}
        : { threshold: options.threshold }),
      ...(options.languages === undefined
        ? {}
        : { languageNames: options.languages }),
      templates: this.configurationService.collectTemplates({
        configuration: selectedTemplates ?? configuration,
        workingDirectory,
      }),
    });

    this.reportResult({ result, workingDirectory });
  }
}
